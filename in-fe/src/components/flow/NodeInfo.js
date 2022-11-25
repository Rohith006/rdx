import React from "react";
import {TuiForm, TuiFormGroup, TuiFormGroupContent, TuiFormGroupHeader} from "../elements/tui/TuiForm";

const NodeInfo = ({node}) => {

    return  <TuiForm>
        <TuiFormGroup>
            <TuiFormGroupHeader header="Plug-in Information"/>
            <TuiFormGroupContent>
                <div className="InfoBox">{node?.data?.metadata?.desc}</div>
                        <div className="SubTitle"><span><span style={{fontWeight: 600}}>Action</span> Details</span></div>
                        <table>
                            <tbody>
                            <tr>
                                <td>Id</td>
                                <td>{node?.id}</td>
                            </tr>
                            <tr>
                                <td>Start acton</td>
                                <td>{node?.data?.start ? "Yes" : "No"}</td>
                            </tr>
                            <tr>
                                <td>Runs only in debug mode</td>
                                <td>{node?.data?.debug ? "Yes" : "No"}</td>
                            </tr>
                            <tr>
                                <td>Inputs</td>
                                <td>{node?.data?.spec?.inputs?.join(',')}</td>
                            </tr>
                            <tr>
                                <td>Outputs</td>
                                <td>{node?.data?.spec?.outputs?.join(',')}</td>
                            </tr>
                            <tr>
                                <td>Component</td>
                                <td>{node?.type}</td>
                            </tr>
                            <tr>
                                <td>Position</td>
                                <td>X:{node?.position?.x}, Y: {node?.position?.y}</td>
                            </tr>
                            {/* <tr>
                                <td>Module</td>
                                <td>{node?.data?.spec?.module}</td>
                            </tr> */}
                            <tr>
                                <td>Class</td>
                                <td>{node?.data?.spec?.className}</td>
                            </tr>
                            {/* <tr>
                                <td>Author</td>
                                <td>{node?.data?.spec?.author}</td>
                            </tr> */}
                            {/* <tr>
                                <td>License</td>
                                <td>{node?.data?.spec?.license}</td>
                            </tr> */}
                            <tr>
                                <td>Version</td>
                                <td>{node?.data?.spec?.version}</td>
                            </tr>
                            </tbody>
                        </table>
            </TuiFormGroupContent>
        </TuiFormGroup>
    </TuiForm>
}

export default NodeInfo;