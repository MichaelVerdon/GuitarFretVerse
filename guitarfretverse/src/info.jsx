import React from 'react';
import './InfoMenu.css';

const InfoPanel = () => {

    let testString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu sapien sodales, posuere nisi non, eleifend libero. Sed rhoncus interdum orci eget fermentum. Aenean sapien quam, ultricies eu pretium iaculis, porttitor et magna. Curabitur lacus massa, feugiat vel auctor a, accumsan et nisl. Suspendisse aliquam libero sed lacus hendrerit fringilla. Nam id vehicula nibh. Sed a ultricies elit. Nulla vehicula placerat velit, in auctor urna malesuada sed. Nulla facilisi. In a urna sed dui tincidunt aliquam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec nec facilisis felis, et tempus diam. Mauris tincidunt, nisi ac aliquam dapibus, erat nisi condimentum libero, ac fermentum diam orci ac nunc. Curabitur condimentum tempor feugiat. Integer et imperdiet lectus, eu varius orci.'
    return(
        <div className='infoPanel'>
            <div className='infoContents'>
                <div className='infoTitle'>A Major</div>
                <div className='infoIntervals'>{"Intervals: " + "1, 2, 3, 4, 5, 6, 7"}</div>
                <div className='infoAbout'>{testString}</div>
            </div>
        </div>
    )
}
export default InfoPanel;