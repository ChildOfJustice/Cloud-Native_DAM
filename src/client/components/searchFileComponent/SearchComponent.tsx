import React from 'react'
import Button from "react-bootstrap/Button";
import {TagInterface} from "./tagInterface";
import Form from "react-bootstrap/Form";
import {Col, Row} from "react-bootstrap";
import {FetchParams, makeFetch} from "../../../interfaces/FetchInterface";
import {FileMetadata} from "../../../interfaces/databaseTables";
import {FileOverviewType} from "../../../interfaces/componentsTypes";

interface IState {
    fileNameToSearch: string
    searchByTagComponentChildrenQuantity: number
    metadataTags: TagInterface[]
}

interface IProps {
    handleFoundFilesChanged: (changedFilesOverviews: FileOverviewType[]) => void
    authToken: string
}

export default class SearchComponent extends React.Component<IProps, IState> {

    private fileNameTagInDatabase = "Name"

    public state: IState = {
        fileNameToSearch: "",
        searchByTagComponentChildrenQuantity: 1,
        metadataTags: [
            {
                id: 0,
                tagName: "",
                tagValue: ""
            }
        ],
    }

    _handleSubmit = (event: any) => {
        event.preventDefault();

        // const bodyMatchAllTagsWithOneValue = {
        //     "query": {
        //         "multi_match": {
        //             "query": "wind",
        //             "fields": ["title^4", "plot"]
        //         }
        //     }
        // }

        let tagMetadataToDsl: { match: { [x: string]: string; } }[] = []
        this.state.metadataTags.forEach(tagInterface => {
            if (tagInterface.tagName != "") {
                if (tagInterface.tagValue == "") {
                    console.log("Tag value is empty - will check for files with specified field")
                } else {
                    let queryWithTermCondition = {
                        "match": {
                            [tagInterface.tagName]: tagInterface.tagValue
                        }
                    }
                    tagMetadataToDsl.push(queryWithTermCondition)
                }
            } else {
                console.log("Tag name is empty - will ignore this tag")
            }
        })

        let findByFileNameRelevance = this._addFileNameSearchOption()

        let openSearchQueryBody: any

        if (tagMetadataToDsl.length == 0 && findByFileNameRelevance.length == 0) {
            //look for all records
            openSearchQueryBody = {
                "query": {
                    "match_all": {}
                }
            }
        }
        else {
            openSearchQueryBody = {
                "query": {
                    "bool": {
                        "must": tagMetadataToDsl,
                        "should": findByFileNameRelevance,
                        // "must": [
                        //     """tag": "Tag2Value"
                        // ]
                        // "must_not": {
                        //     "term": {
                        //         "field2": "Y"
                        //     }
                        // }
                    }
                }
            }
        }

        // const body = {
        //     //"size": 20,  <- pagination
        //     "query": {
        //         "query_string": {
        //             "query": "Tag2Value"
        //         }
        //     }
        // }

        const {authToken} = this.props;

        const fetchParams: FetchParams = {
            url: '/files/search',
            token: authToken,
            method: 'POST',
            body: openSearchQueryBody,

            actionDescription: "post opensearch request"
        }

        makeFetch<any>(fetchParams)
            .then(jsonResponse => {

                console.log("GOT THE RESPONSE FROM OpenSearch:")
                console.log(jsonResponse)
                //THIS PART IS ONLY FOR TESTING, we will have a lambda with this
                //let foundDataArray = jsonResponse.hits.hits
                //

                let foundFiles: FileMetadata[] = []
                jsonResponse.forEach( (foundItem: any) => {

                    let file: FileMetadata = {
                        name: foundItem._source.Name,
                        S3uniqueName: foundItem._source.S3uniqueName,
                        cloud: foundItem._source.Cloud,
                        uploadedBy: foundItem._source.UploadedBy,
                        ownedBy: foundItem._source.OwnedBy,
                        sizeOfFile_MB: foundItem._source.SizeOfFile_MB,
                        tagsKeys: [],
                        tagsValues: [],
                    }

                    let allTagKeys: string[] = []
                    let allTagValues: string[] = []

                    //TODO: this is AWFUL
                    const mainFileInfoFields = { Name: 1, S3uniqueName: 2, Cloud: 3, UploadedBy: 4, OwnedBy: 5, SK: 6, ID: 7, Data: 8, SizeOfFile_MB: 9};

                    for (const property in foundItem._source) {
                        if(!(property in mainFileInfoFields)){
                            //if this property is not from fileInterface - its a tag
                            allTagKeys.push(property)
                            allTagValues.push(foundItem._source[property])
                        }
                    }

                    file.tagsKeys = allTagKeys
                    file.tagsValues = allTagValues

                    foundFiles.push(file)
                })

                let newFilesOverview: FileOverviewType[] = foundFiles.map((item: any, i: number) => {
                    return {
                        id: i,
                        isChecked: false,
                        file: item
                    }
                })

                this.props.handleFoundFilesChanged(newFilesOverview)
            }
        ).catch(error => {
            console.log("Error for opensearch fetch: " + error)
        })
    }

    _addFileNameSearchOption(): { match: { [x: string]: string; }; }[] {
        let res = []
        if(this.state.fileNameToSearch != ""){
            let queryWithTermCondition = {
                "match": {
                    [this.fileNameTagInDatabase]: this.state.fileNameToSearch
                }
            }
            res.push(queryWithTermCondition)
        }
        return res
    }



    _onChangeFileName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({fileNameToSearch: (e.target as HTMLInputElement).value})
    }

    _onChangeTagName = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const _metadataTags = this.state.metadataTags.slice(); // Make a copy of the emails first.

        if (_metadataTags[index] == undefined) {
            _metadataTags[index] = {
                id: index,
                tagName: (e.target as HTMLInputElement).value,
                tagValue: ""
            }
        } else {
            _metadataTags[index].tagName = (e.target as HTMLInputElement).value; // Update it with the modified email.
        }

        this.setState({metadataTags: _metadataTags}); // Update the state.
    }
    _onChangeTagValue = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const _metadataTags = this.state.metadataTags.slice(); // Make a copy of the emails first.

        if (_metadataTags[index] == undefined) {
            _metadataTags[index] = {
                id: index,
                tagName: "",
                tagValue: (e.target as HTMLInputElement).value
            }
        } else {
            _metadataTags[index].tagValue = (e.target as HTMLInputElement).value; // Update it with the modified email.
        }

        this.setState({metadataTags: _metadataTags}); // Update the state.
    }

    addMetadataTag = () => {
        let newSearchByTagComponentChildrenQuantity = this.state.searchByTagComponentChildrenQuantity;
        newSearchByTagComponentChildrenQuantity += 1
        this.setState({searchByTagComponentChildrenQuantity: newSearchByTagComponentChildrenQuantity})
    }

    render() {
        const children = [];

        for (let index = 0; index < this.state.searchByTagComponentChildrenQuantity; index += 1) {
            children.push(
                <div key={index}>
                    <Row>
                        <Col>
                            <Form.Control onChange={this._onChangeTagName.bind(this, index)} type="string" placeholder="Tag Name" aria-describedby="tagNameHelpText"/>
                        </Col>
                        <Col>
                            <Form.Control onChange={this._onChangeTagValue.bind(this, index)} type="string" placeholder="Tag Value" aria-describedby="tagValueHelpText"/>
                        </Col>
                    </Row>
                </div>
            );
        }

        return (
            <Form onSubmit={this._handleSubmit}>
                <Form.Group controlId="Query" >
                    <Form.Text>
                        Empty field means no restrictions
                    </Form.Text>

                    <Form.Label>By file name</Form.Label>
                    <Form.Control onChange={this._onChangeFileName} type="string" placeholder="File name"/>

                    <br/>

                    <Row>
                        <Col>
                            <Form.Text id="tagNameHelpText" muted>
                                Tag name to search by attached metadata.
                            </Form.Text>
                        </Col>
                        <Col>
                            <Form.Text id="tagValueHelpText" muted>
                                The Value of the tag with name that you specified in the left field.
                            </Form.Text>
                        </Col>
                    </Row>

                    {children}

                    <Button onClick={this.addMetadataTag} variant="info">
                        Add metadata tag
                    </Button>


                    <Button variant="primary" type="submit">
                        Search
                    </Button>
                </Form.Group>
            </Form>
        )
    }
}