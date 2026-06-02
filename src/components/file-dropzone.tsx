import type {FC} from 'react';
import PropTypes from 'prop-types';
import type {DropzoneOptions, FileWithPath} from 'react-dropzone';
import {useDropzone} from 'react-dropzone';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

import {FileIcon} from 'src/components/file-icon';
import {bytesToSize} from 'src/utils/bytes-to-size';

export interface CustomFile {
  name: string;
  type: string;
  path?: string;
}
import { getUploadUrl } from 'src/api/file-manager';

export type File = FileWithPath;

interface FileDropzoneProps extends DropzoneOptions {
    caption?: string;
    files?: File[];
    folder?: string;
    onRemove?: (file: File) => void;
    onRemoveAll?: () => void;
    onUpload?: () => void;
    onFilesUploaded?: (files: CustomFile[]) => void;
}

export const FileDropzone: FC<FileDropzoneProps> = (props) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadedFilesState, setUploadedFilesState] = useState<File[]>([]);
    const [displayFiles, setFiles] = useState<File[]>([]);

    const {caption, files = [], folder = '', onRemove, onRemoveAll, onUpload, ...other} = props;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map((file: any) => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        },
        ...other
    });

    useEffect(() => {
        setFiles([...files]);
    }, [files]);

    const hasAnyFiles = displayFiles.length > 0;

    const uploadToS3 = async (file: FileWithPath) => {
        const key = folder + file.name;
        try {
            const url = await getUploadUrl(key, file.type || 'application/octet-stream');
            await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type || 'application/octet-stream' },
            });
            setMessage(`Uploaded ${file.name}`);
            setOpen(true);
            return file;
        } catch (error) {
            setMessage(`Error uploading ${file.name}`);
            setOpen(true);
            console.error('Error uploading file: ', error);
            return null;
        }
    };

    const handleUpload = async () => {
        let successfullyUploadedFiles: FileWithPath[] = [];
        for (const file of displayFiles) {
            const uploadedFile = await uploadToS3(file);
            if (uploadedFile) {
                successfullyUploadedFiles.push(uploadedFile);
            }
        }

        const customFiles: CustomFile[] = successfullyUploadedFiles.map(file => ({
            name: file.name,
            type: file.type || '',
            path: `${props.folder}${file.path}`,
        }));

        if (props.onFilesUploaded) {
            props.onFilesUploaded(customFiles);
        }

        setFiles(prevFiles => prevFiles.filter(f => !successfullyUploadedFiles.includes(f)));
        onUpload?.();
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRemove = (file: File) => {
        onRemove?.(file);
        setFiles(prevFiles => prevFiles.filter(f => f !== file));
    };

    return (
        <div>
            <Box
                sx={{
                    alignItems: 'center',
                    border: 1,
                    borderRadius: 1,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    outline: 'none',
                    p: 6,
                    ...(
                        isDragActive && {
                            backgroundColor: 'action.active',
                            opacity: 0.5
                        }
                    ),
                    '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer',
                        opacity: 0.5
                    }
                }}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                >
                    <Avatar
                        sx={{
                            height: 64,
                            width: 64
                        }}
                    >
                        <SvgIcon>
                            <Upload01Icon/>
                        </SvgIcon>
                    </Avatar>
                    <Stack spacing={1}>
                        <Typography
                            sx={{
                                '& span': {
                                    textDecoration: 'underline'
                                }
                            }}
                            variant="h6"
                        >
                            <span>Click to upload</span> or drag and drop
                        </Typography>
                        {caption && (
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                {caption}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Box>
            {hasAnyFiles && (
                <Box sx={{mt: 2}}>
                    <List>
                        {displayFiles.map((file) => {
                            const extension = file.name.split('.').pop();

                            return (
                                <ListItem
                                    key={file.path}
                                    sx={{
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        '& + &': {
                                            mt: 1
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <FileIcon extension={extension}/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                        primaryTypographyProps={{variant: 'subtitle2'}}
                                        secondary={bytesToSize(file.size)}
                                    />
                                    {!uploadedFilesState.includes(file) && (
                                        <Tooltip title="Remove">
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemove(file)}
                                            >
                                                <SvgIcon>
                                                    <XIcon/>
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </ListItem>
                            );
                        })}
                    </List>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="flex-end"
                        spacing={2}
                        sx={{mt: 2}}
                    >
                        <Button
                            color="inherit"
                            onClick={() => {onRemoveAll?.(); setFiles([]);}}
                            size="small"
                            type="button"
                        >
                            Remove All
                        </Button>
                        <Button
                            onClick={handleUpload}
                            size="small"
                            type="button"
                            variant="contained"
                        >
                            Upload
                        </Button>
                    </Stack>
                </Box>
            )}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
};

FileDropzone.propTypes = {
    caption: PropTypes.string,
    files: PropTypes.array,
    folder: PropTypes.string,
    onRemove: PropTypes.func,
    onRemoveAll: PropTypes.func,
    onUpload: PropTypes.func,
    accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string.isRequired).isRequired),
    disabled: PropTypes.bool,
    getFilesFromEvent: PropTypes.func,
    maxFiles: PropTypes.number,
    maxSize: PropTypes.number,
    minSize: PropTypes.number,
    noClick: PropTypes.bool,
    noDrag: PropTypes.bool,
    noDragEventsBubbling: PropTypes.bool,
    noKeyboard: PropTypes.bool,
    onDrop: PropTypes.func,
    onDropAccepted: PropTypes.func,
    onDropRejected: PropTypes.func,
    onFileDialogCancel: PropTypes.func,
    preventDropOnDocument: PropTypes.bool
};
