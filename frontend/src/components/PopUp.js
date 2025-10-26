import React,{useEffect, useRef} from 'react';
import "../styles/PopUp.css"

function PopUp({isVisible, message, onClose}){
    // ref to DOM dialog
    const dialogRef = useRef(null);
    // when isVisible run
    useEffect(() =>{
        const dialog=dialogRef.current;
        // retrun if dialog is not available
        if(!dialog) return;
        if(isVisible){
            dialog.showModal();
        }
        else{
            dialog.close();
        }
    },[isVisible]);

    return(
        <dialog 
            ref={dialogRef}    
            className="popup"
            onClose={onClose}
        >
            <p>{message}</p>
            <button className="btn-pop-close" onClick={onClose}>Close</button>
        </dialog>
    );

}

export default PopUp;