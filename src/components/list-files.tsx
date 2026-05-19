import {FC, useState} from "react";
import Modal from "@mui/material/Modal";
import List from "@mui/material/List";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileIcon } from "./file-icon";
import DocumentViewer from '../pages/dashboard/viewers/generic';
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import SvgIcon from "@mui/material/SvgIcon";

export interface CustomFile {
    name: string;
    type: string;
    path?: string;
}

interface FileListProps {
    files: CustomFile[];
    path?: string;
}

export const FileList: FC<FileListProps> = ({files, path = ""}) => {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<CustomFile | null>(null);

    const handleOpen = (file: CustomFile) => {
        // Create the full path by combining the provided path and the file's name
        const fullPath = `${path}${file.name}`;
        const updatedFile = {
            ...file,
            path: fullPath
        };
        setSelectedFile(updatedFile);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedFile(null);
    };

    return (
        <div>
            <List>
                {files.map((file) => {
                    const extension = file.name.split('.').pop();

                    return (
                        <ListItem
                            key={file.name}
                            sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                '& + &': {
                                    mt: 1
                                }
                            }}
                            onClick={() => handleOpen(file)}
                        >
                            <ListItemIcon>
                                <FileIcon extension={extension} />
                            </ListItemIcon>
                            <ListItemText
                                primary={file.name}
                                primaryTypographyProps={{variant: 'subtitle2'}}
                                secondary={file.type}
                            />
                            <SvgIcon>
                                <ArrowRightIcon/>
                            </SvgIcon>
                        </ListItem>
                    );
                })}
            </List>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="document-viewer-modal"
                aria-describedby="document-viewer-description"
            >
                <div style={{
                    outline: 'none',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80vw',
                    height: '80vh',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    padding: '16px',
                    position: 'relative'
                }}>
                    <CloseIcon
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            cursor: 'pointer',
                            color: '#333',
                            zIndex: 1000
                        }}
                        onClick={handleClose}
                    />
                    {selectedFile && <DocumentViewer file={selectedFile} manager={true} />}
                </div>
            </Modal>
        </div>
    );
};
