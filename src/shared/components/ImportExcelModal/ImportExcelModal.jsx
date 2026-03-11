import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Button, Tag, Space, message, Typography, Spin } from 'antd';
import * as XLSX from 'xlsx';
import * as yup from 'yup';

const { Text } = Typography;

const EXCEL_COLUMNS = [
  'topicName',
  'skillName',
  'part',
  'subPart',
  'questionType',
  'sequence',
  'audioLink',
  'imageLink',
  'question',
  'questionContent',
  'correctAnswer',
  'subQuestion',
  'groupQuestion',
];

const importSchema = yup.object().shape({
  topicName: yup.string().required('Required'),
  skillName: yup.string().required('Required'),
  part: yup.string().required('Required'),
  questionType: yup.string().required('Required'),
  sequence: yup.string().required('Required'),
});

const ImportExcelModal = ({ open, onCancel, file, onConfirm, loading, onDownloadTemplate }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);

  const parseFile = useCallback((file) => {
    setIsParsing(true);
    setParseProgress(0);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        if (!worksheet['!ref']) {
          message.error('File is empty');
          setIsParsing(false);
          return;
        }

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        // 1. Tìm dòng thực tế cuối cùng có dữ liệu (Max Row)
        // Quét ngược từ dưới lên để cực kỳ nhanh
        let lastRealRow = -1;
        for (let r = range.e.r; r >= range.s.r; r--) {
          for (let c = 0; c <= 12; c++) {
            const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
            if (cell && cell.v !== null && cell.v !== undefined && String(cell.v).trim() !== "") {
              lastRealRow = r;
              break;
            }
          }
          if (lastRealRow !== -1) break;
        }

        if (lastRealRow < 1) { // Chỉ có header hoặc trống
          message.error('No data rows found');
          setIsParsing(false);
          return;
        }

        const rows = [];
        let currentRow = 1; // Bỏ qua header (dòng 0)
        const CHUNK_SIZE = 100; // Xử lý 100 dòng mỗi đợt để không treo UI

        const processChunks = () => {
          const chunkEnd = Math.min(currentRow + CHUNK_SIZE, lastRealRow + 1);
          
          for (; currentRow < chunkEnd; currentRow++) {
            let hasData = false;
            const rowObj = { key: currentRow };
            
            EXCEL_COLUMNS.forEach((col, cIdx) => {
              const cell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: cIdx })];
              const val = cell ? String(cell.v).trim() : '';
              if (val) hasData = true;
              rowObj[col] = val;
            });

            if (hasData) {
              try {
                importSchema.validateSync(rowObj, { abortEarly: false });
                rows.push({ ...rowObj, errors: [] });
              } catch (err) {
                rows.push({ 
                  ...rowObj, 
                  errors: err.inner.map((e) => ({ path: e.path, message: e.message })) 
                });
              }
            }
          }

          setParseProgress(Math.round((currentRow / lastRealRow) * 100));

          if (currentRow <= lastRealRow) {
            // Dùng requestAnimationFrame để trình duyệt có thời gian vẽ lại Spin
            requestAnimationFrame(processChunks);
          } else {
            // Hoàn thành
            const hasErrors = rows.some((r) => r.errors.length > 0);
            setIsValid(!hasErrors);
            setDataSource(rows);
            setIsParsing(false);
          }
        };

        requestAnimationFrame(processChunks);

      } catch (error) {
        console.error("Parse error:", error);
        message.error("Failed to parse Excel file");
        setIsParsing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  useEffect(() => {
    if (open && file) {
      parseFile(file);
    } else {
      setDataSource([]);
      setIsValid(false);
      setIsParsing(false);
    }
  }, [open, file, parseFile]);

  const columns = [
    {
      title: 'Status',
      key: 'status',
      width: 90,
      fixed: 'left',
      render: (_, record) => (
        record.errors.length > 0 ? (
          <Tag color="error">Invalid</Tag>
        ) : (
          <Tag color="success">Valid</Tag>
        )
      ),
    },
    ...EXCEL_COLUMNS.map((col) => ({
      title: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'),
      dataIndex: col,
      key: col,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        const error = record.errors?.find((e) => e.path === col);
        return (
          <div title={text}>
            <span style={{ color: error ? '#f5222d' : 'inherit' }}>{text || '-'}</span>
            {error && <div style={{ fontSize: '10px', color: '#f5222d' }}>{error.message}</div>}
          </div>
        );
      },
    }))
  ];

  return (
    <Modal
      title="Import Preview"
      open={open}
      onCancel={onCancel}
      width={1300}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="template" onClick={onDownloadTemplate}>
          Download Template
        </Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={!isValid || dataSource.length === 0 || isParsing}
          onClick={() => onConfirm(file)}
          loading={loading}
        >
          Confirm Import
        </Button>,
      ]}
    >
      <Spin spinning={isParsing} tip={`Parsing data... ${parseProgress}%`}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className="flex justify-between items-center">
            <Text>
              Total data rows: <b>{dataSource.length}</b>. 
              { !isValid && dataSource.length > 0 && (
                <Text type="danger" className="ml-2">Please fix errors in the file and re-upload.</Text>
              )}
            </Text>
          </div>
          <Table
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: 'max-content', y: 450 }}
            pagination={{ pageSize: 50, showSizeChanger: true }}
            bordered
            size="small"
            rowClassName={(record) => record.errors.length > 0 ? 'bg-red-50' : ''}
          />
        </Space>
      </Spin>
    </Modal>
  );
};

export default ImportExcelModal;
