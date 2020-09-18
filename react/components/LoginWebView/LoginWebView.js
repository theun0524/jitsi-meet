import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import WebView from 'react-native-webview';
import { useSelector, useStore } from 'react-redux';

import { getLocationURL } from '../../api/url';

const LoginWebView = ({onReceiveToken}) => {
    const { authRequired } = useSelector(store => store)['features/base/conference'];
    const room = authRequired && authRequired.getName();
    
    const store = useStore();
    const [ userAgent, setUserAgent ] = useState();
    const [ token, setToken ] = useState();
    const loginURL = `${getLocationURL(store.getState())}/auth/page/login?next=${room}`;

    useEffect(()=> {
      if(token) {
        onReceiveToken(token);
      }
    }, [token]);

    const onMessage = event => {
      setToken(event.nativeEvent.data);
    };

    useEffect(() => {
        DeviceInfo.getUserAgent()
        .then(res => {
            setUserAgent(res);
        })
        .catch(err => console.log(err));
    });

    return token ? <></> : (
        <WebView
            onMessage = { onMessage }
            source = {{
                uri: loginURL,
                origin: loginURL
            }}
            startInLoadingState = { true }
            style = {{ width: '100%' }}
            userAgent = { userAgent } />
    )
};

export default LoginWebView;
