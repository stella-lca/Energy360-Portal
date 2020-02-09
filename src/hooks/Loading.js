import React from 'react';
import Loader from 'react-loader-spinner'
import ReactDelayRender from 'react-delay-render';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"


const Loading = () => <Loader
    type="Puff"
    color="#00BFFF"
    height={100}
    width={100}
/>;

export default ReactDelayRender({ delay: 300 })(Loading);