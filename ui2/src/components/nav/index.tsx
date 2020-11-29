import React from 'react';

import {
    Alignment,
    Button,
    Classes,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
 
import './style.scss';

function Nav() {
  return (
    <Navbar className="components-nav">
      <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>Phynk</NavbarHeading>
          <NavbarDivider />
          <Button className={Classes.MINIMAL} icon="book" text="Home" />
      </NavbarGroup>
  </Navbar>
  );
}

export default Nav;
