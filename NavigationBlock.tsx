import React, { FC, useState, useEffect } from 'react';
import { SizeMeProps, withSize } from 'react-sizeme';

import { FlexBox, FlexItem } from 'src/components/styled/blocks';
import { NavMenuWithSize, BorderSelected } from 'src/components/Header/StyledHeader';
import { IMenuItem, MenuItem } from 'src/components/Header/components/MenuItem';
import { HiddenMenu } from 'src/components/Header/components/HiddenMenu';

const ELLIPSIS_WIDTH = 50;
const LOGO_MARGIN = 31;
const MENU_ITEM_MARGIN = 30;

interface IMenuItemsSizes {
  [key: string]: number;
}

export interface IHeaderProps {
  menuItems?: IMenuItem[];
}

const NavigationBlock: FC<IHeaderProps & SizeMeProps> = ({ menuItems, size: blockSize }) => {
  const [menuItemsSizes, setMenuItemsSizes] = useState<IMenuItemsSizes>(
    Object?.fromEntries?.(menuItems.map((item) => [item.text, 0])) || {},
  );
  const [visibleMenuItems, setVisibleMenuItems] = useState([]);
  const [hiddenMenuItems, setHiddenMenuItems] = useState([]);
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);
  const [firstBlockWidth, setFirstBlockWidth] = useState(0);

  useEffect(() => {
    markSelected();
  }, [menuItemsSizes, visibleMenuItems, hiddenMenuItems]);

  useEffect(() => {
    setVisibleAndHiddenItems();
  }, [blockSize, menuItems]);

  const getWidthByMenuItemText = (text: string) => {
    return menuItemsSizes[text] || 0;
  };

  const getLeftOffsetByMenuItemText = (text: string) => {
    let itemsLeftOffset = 0;

    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].text === text) {
        return itemsLeftOffset;
      }

      itemsLeftOffset =
        itemsLeftOffset + getWidthByMenuItemText(menuItems[i].text) + MENU_ITEM_MARGIN;
    }

    return itemsLeftOffset;
  };

  // клик по пункту меню, если нету обработчика, то ничего не делаем
  // высчитывает его offset и задает его положение черточке, так же сетим его ширину, +1 делаем чтобы черточка была чуть шире
  const onMenuItemClickHandler = (e: React.MouseEvent | React.UIEvent, item: IMenuItem) => {
    if (!item.onClickHandler) return;

    const width = getWidthByMenuItemText(item.text);
    const offsetLeft = getLeftOffsetByMenuItemText(item.text);

    setLeft(offsetLeft || 0);
    setWidth(width + 1);

    item.onClickHandler(e);
  };

  // вызываем если активный пункт меню находится в троеточии
  const selectEllipsis = () => {
    const beforeEllipsisItem = visibleMenuItems.slice(-1)[0];

    if (!beforeEllipsisItem) {
      setLeft(0);
      setWidth(ELLIPSIS_WIDTH);

      return null;
    }

    const width = getWidthByMenuItemText(beforeEllipsisItem.text);
    const offsetLeft = getLeftOffsetByMenuItemText(beforeEllipsisItem.text);
    const leftToEllipsis = width + offsetLeft + LOGO_MARGIN;

    setWidth(ELLIPSIS_WIDTH);
    setLeft(leftToEllipsis);
  };

  // высчитываем положение черточки
  const markSelected = () => {
    const selectedVisibleItem = visibleMenuItems.find((item) => item.active);
    const selectedHiddenItem = hiddenMenuItems.find((item) => item.active);

    if (selectedVisibleItem) {
      const width = getWidthByMenuItemText(selectedVisibleItem.text);
      const offsetLeft = getLeftOffsetByMenuItemText(selectedVisibleItem.text);

      setWidth(width);
      setLeft(offsetLeft);
    } else if (selectedHiddenItem) {
      selectEllipsis();
    } else {
      setWidth(0);
      setLeft(0);
    }
  };

  const onMenuItemSizeChangeHandler = (width: number, text: string) => {
    if (width > 0 && getWidthByMenuItemText(text) < width) {
      const newMenuItemsWithSize = {
        ...menuItemsSizes,
        [text]: width,
      };

      setMenuItemsSizes(newMenuItemsWithSize);
    }
  };

  const setVisibleAndHiddenItems = () => {
    const delta = 10;
    let newVisibleMenuItems = [];
    let newHiddenMenuItems = [];
    let allWidth = firstBlockWidth || blockSize.width;
    let allItemsHasWidth = true;

    menuItems.forEach((item, index) => {
      const itemWidth = getWidthByMenuItemText(item.text);

      if (itemWidth === 0) {
        allItemsHasWidth = false;
      }

      allWidth = allWidth - (MENU_ITEM_MARGIN + itemWidth);

      if (
        (index === menuItems.length - 1 && allWidth > delta) ||
        allWidth > ELLIPSIS_WIDTH + delta
      ) {
        newVisibleMenuItems.push({ ...item });
      } else {
        newHiddenMenuItems.push({
          ...item,
          onClickHandler: (e: React.MouseEvent<Element, MouseEvent>) => {
            selectEllipsis();
            item.onClickHandler(e);
          },
        });
      }
    });

    setFirstBlockWidth(!allItemsHasWidth ? blockSize.width : 0);
    setVisibleMenuItems(newVisibleMenuItems);
    setHiddenMenuItems(newHiddenMenuItems);
  };

  return (
    <FlexBox justifyContent="flex-start" alignItems="center">
      <NavMenuWithSize onSize={markSelected}>
        <FlexBox justifyContent="flex-start">
          {visibleMenuItems.map((item: IMenuItem) => (
            <MenuItem
              {...item}
              key={item.text}
              onClickHandler={(e) => onMenuItemClickHandler(e, item)}
              onSizeChangeHandler={(size) => onMenuItemSizeChangeHandler(size.width, item.text)}
            />
          ))}
        </FlexBox>
      </NavMenuWithSize>

      <BorderSelected width={width} left={left} bottom={-12} height={3} />

      {hiddenMenuItems.length > 0 && (
        <FlexItem margin="-10px 0 -16px 0">
          <HiddenMenu items={hiddenMenuItems} />
        </FlexItem>
      )}
    </FlexBox>
  );
};

export default withSize({ noPlaceholder: true })(NavigationBlock);
