import React from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';

type Props = {
  children?: React.ReactNode;
  wide?: boolean;
};

const Instructions = ({ children }: Props) => (
  <div className="ocm-instructions">
    <Content
      component={ContentVariants.ol}
      className={'pf-v6-u-max-width'}
    >
      {children}
    </Content>
  </div>
);

export default Instructions;
