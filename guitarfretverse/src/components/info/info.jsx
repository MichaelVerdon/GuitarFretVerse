import React from 'react';
import './InfoMenu.css';

const InfoPanel = ({infoArray}) => {
    return(
        <div className='infoPanel'>
            <div className='infoContents'>
                <div className='infoTitle'>{infoArray[0]}</div>
                <div className='infoIntervals'>{"Intervals: " + infoArray[1]}</div>
                <div className='infoAbout'>{infoArray[2]}</div>
            </div>
        </div>
    )
}
export default InfoPanel;