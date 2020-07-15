import React from "react";
import { RecoilRoot } from "recoil";
import "../../i18n";
import GeneralNavigator from "../../navigation/GeneralNavigator";

const AppContainer = (props) => {
  return (
    <RecoilRoot>
      <GeneralNavigator appProps={props} />
    </RecoilRoot>
  );
};

export default AppContainer;
