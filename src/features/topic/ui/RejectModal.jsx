import React, { useState } from "react";
import { Modal, Input, Typography, Alert, Button } from "antd";
const { Text } = Typography;

const RejectExamModal = ({ open, onClose, onSubmit }) => {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (reason.trim().length < 10) return;
        onSubmit(reason.trim());
        setReason("");
    };

    const handleCancel = () => {
        setReason("");
        onClose();
    };

    return (
        <Modal
            open={open}
            footer={null}
            onCancel={handleCancel}
            centered
            width={480}
            closable={false}
            maskClosable={false}
            bodyStyle={{ padding: 28 }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 88,
                    marginBottom: 20
                }}
            >
                <img src="./assets/images/Warning.png" style={{ width: 36, height: 36 }} />
                <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>Reject Exam</h2>
            </div>

            <p style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}>
                Are you sure you want to reject this exam?
            </p>

            <Alert
                message="Once rejected, the exam will need revision before it can be approved again. Please provide a clear reason to help the instructor understand the required changes."
                type="warning"
                showIcon
                style={{
                    marginBottom: 20,
                    alignItems: "flex-start",
                    display: "flex"
                }}
            />

            <div style={{ marginBottom: 8, fontWeight: 600 }}>
                Reason for rejection <span style={{ color: "red" }}>*</span>
            </div>

            <Input.TextArea
                rows={4}
                placeholder="Enter the reason for rejecting this exam (e.g., content errors, formatting issues, unclear instructions)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                    borderRadius: 10,
                    padding: 10,
                }}
            />

            <div style={{ marginTop: 6, fontSize: 13, color: "gray" }}>
                Minimum 10 characters required
            </div>

            <div
                style={{
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                }}
            >
                <Button onClick={handleCancel} style={{ height: 40 }}>
                    Cancel
                </Button>

                <Button
                    type="primary"
                    danger
                    style={{
                        height: 40,
                        background: "#d32f2f",
                        opacity: reason.trim().length < 10 ? 0.6 : 1
                    }}
                    disabled={reason.trim().length < 10}
                    onClick={handleConfirm}
                >
                    Reject Exam
                </Button>
            </div>
        </Modal>
    );
};

export default RejectExamModal;
