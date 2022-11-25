import React from "react";
import {BiError} from "react-icons/bi";

export default function TuiFormError({message}) {
    return <div className="TuiFormError">
        <BiError size={25} style={{marginRight: 8}}/>{message}
    </div>
}