
import React, { useRef } from 'react';

import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuItemProps,
  MenuToggle,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom-v5-compat';
import { NavigationPath } from '../../../../../../../NavigationPath';

//import { Link } from '~/common/routing';

interface CreateClusterDropDownProps {
  toggleId?: string;
  isDisabled?: boolean;
  onCliClick?: any;
  onInterfaceClick?: any;
}

const getStartedPath = '/create/rosa/getstarted';

const CreateButtonLink = (props: any) => <Link {...props} to={NavigationPath.prerequisites} />;

const CreateClusterDropDown = ({ toggleId, isDisabled, onCliClick, onInterfaceClick }: CreateClusterDropDownProps) => {
  const [isDropDownOpen, setIsDropDownOpen] = React.useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const dropDownRef = React.useRef<HTMLButtonElement>(null);

  const newDropdownItems = (
    <DropdownList>
      <DropdownItem key="action" onClick={onCliClick}>With CLI</DropdownItem>
      <DropdownItem key="wizard" onClick={(() => onInterfaceClick(true))}>With web interface</DropdownItem>
    </DropdownList>
  );

  const onToggleClick = () => {
    setIsDropDownOpen(!isDropDownOpen);
    dropDownRef.current?.focus();
  };
  const onSelect = () => {
    setIsDropDownOpen(false);
    dropDownRef.current?.focus();
  };

  return (
    <Flex direction={{ default: 'row' }}>
      <FlexItem>
        <Dropdown
          ref={dropDownRef}
          isOpen={isDropDownOpen}
          onSelect={onSelect}
          onOpenChange={(isOpen) => setIsDropDownOpen(isOpen)}
          popperProps={{ appendTo: () => document.body }}
          className="openshift"
          toggle={{
            toggleRef: menuToggleRef,
            toggleNode: (
              <MenuToggle
                id={toggleId}
                ref={menuToggleRef}
                onClick={onToggleClick}
                isExpanded={isDropDownOpen}
                variant={ButtonVariant.primary}
                className="create-button"
                data-testid="rosa-create-cluster-button"
                isDisabled={isDisabled}
              >
                Create cluster
              </MenuToggle>
            ),
          }}
        >
          {newDropdownItems}
        </Dropdown>
      </FlexItem>

      <FlexItem>
        <Button
          variant="secondary"
          className="create-button"
          component={CreateButtonLink}
          isDisabled={isDisabled}
        >
          Prerequisites
        </Button>
      </FlexItem>
    </Flex>
  );
};

export default CreateClusterDropDown;
