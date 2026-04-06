import React, { useEffect, useMemo, useState } from 'react';
import { Upload, Typography, message } from 'antd';
import {
  AudioOutlined,
  FileImageOutlined,
  InboxOutlined,
} from '@ant-design/icons';

import axiosInstance from '@shared/config/axios';

const { Dragger } = Upload;
const { Text } = Typography;
const DEFAULT_MAX_FILE_SIZE_MB = 10;

const normalizeFileName = (url, fallbackName) => {
  if (!url) return fallbackName;

  try {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.split('/').pop();
    return decodeURIComponent(fileName || fallbackName);
  } catch {
    const fileName = url.split('/').pop();
    return fileName || fallbackName;
  }
};

const buildUploadedFile = (url, fallbackName) => ({
  uid: url,
  name: normalizeFileName(url, fallbackName),
  status: 'done',
  url,
});

const MinioUploadDragger = ({
  value,
  onChange,
  bucketType,
  accept,
  allowedMimeTypes,
  maxSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  title,
  hint,
  listType = 'text',
}) => {
  const [fileList, setFileList] = useState(
    value
      ? [
          buildUploadedFile(
            value,
            bucketType === 'audios' ? 'audio.mp3' : 'image'
          ),
        ]
      : []
  );

  const fallbackName = useMemo(
    () => (bucketType === 'audios' ? 'audio.mp3' : 'image'),
    [bucketType]
  );

  useEffect(() => {
    setFileList((prev) => {
      const hasUploadingFile = prev.some((file) => file.status === 'uploading');
      if (hasUploadingFile) return prev;
      if (!value) return [];

      const currentUrl = prev[0]?.url;
      if (currentUrl === value && prev[0]?.status === 'done') {
        return prev;
      }

      return [buildUploadedFile(value, fallbackName)];
    });
  }, [fallbackName, value]);

  const validateFile = (file) => {
    if (
      Array.isArray(allowedMimeTypes) &&
      allowedMimeTypes.length > 0 &&
      !allowedMimeTypes.includes(file.type)
    ) {
      message.error(`Invalid file type: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 > maxSizeMB) {
      message.error(`File size must be less than or equal to ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const uploadProps = {
    accept,
    beforeUpload: validateFile,
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      try {
        const pendingFile = {
          uid: file.uid,
          name: file.name,
          status: 'uploading',
          percent: 0,
        };

        setFileList([pendingFile]);

        const { data } = await axiosInstance.post('/presigned-url/upload-url', {
          fileName: file.name,
          type: bucketType,
        });

        const { uploadUrl, fileUrl } = data;
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          const total = event.total || file.size;
          const percent = Math.round((event.loaded / total) * 100);

          setFileList([
            {
              ...pendingFile,
              percent,
            },
          ]);

          onProgress?.({ percent });
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const uploadedFile = buildUploadedFile(fileUrl, file.name);
            setFileList([uploadedFile]);
            onChange?.(fileUrl);
            onSuccess?.({ fileUrl });
            return;
          }

          const error = new Error('Upload failed');
          setFileList([]);
          onError?.(error);
          message.error('Upload failed');
        };

        xhr.onerror = () => {
          const error = new Error('Upload failed');
          setFileList([]);
          onError?.(error);
          message.error('Upload failed');
        };

        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      } catch (error) {
        setFileList([]);
        onError?.(error);
        message.error('Upload failed');
      }
    },
    fileList,
    listType,
    maxCount: 1,
    multiple: false,
    onRemove: () => {
      setFileList([]);
      onChange?.(null);
      return true;
    },
    onPreview: (file) => {
      const previewUrl = file.url || file.response?.fileUrl;
      if (previewUrl) {
        window.open(previewUrl, '_blank', 'noopener,noreferrer');
      }
    },
    progress: {
      strokeWidth: 4,
      showInfo: true,
    },
    showUploadList: {
      showDownloadIcon: false,
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  return (
    <Dragger
      {...uploadProps}
      className='rounded-xl bg-[#FCFDFE]'
      style={{ padding: '8px 0' }}
    >
      <div className='flex flex-col items-center gap-2 px-4 py-3 text-center'>
        {bucketType === 'audios' ? (
          <AudioOutlined className='text-[28px] text-[#003087]' />
        ) : (
          <FileImageOutlined className='text-[28px] text-[#003087]' />
        )}
        <Text strong>{title || 'Drag and drop file here'}</Text>
        <Text type='secondary'>
          {hint || 'Click or drag a file to upload'}
        </Text>
        <Text type='secondary'>Maximum file size: {maxSizeMB}MB</Text>
        <div className='flex items-center gap-2 text-[#003087]'>
          <InboxOutlined />
          <Text className='!text-[#003087]'>Choose file</Text>
        </div>
      </div>
    </Dragger>
  );
};

export default MinioUploadDragger;
