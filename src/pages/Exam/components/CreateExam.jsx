import React, { useEffect, useState } from "react";
import HeaderInfo from '@app/components/HeaderInfo';
import {
    AudioOutlined,
    ReadOutlined,
    EditOutlined,
    BookOutlined,
    CustomerServiceOutlined
} from "@ant-design/icons";
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    Typography,
    Divider,
    message
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateTopic, useCreateTopicSection, useGetTopicWithRelations, useUpdateTopic, useUpdateTopicSection } from "@features/topic/hooks";
import ChooseSectionModal from "@features/topic/ui/ChooseSectionModal";

const { Text, Title } = Typography;

const SKILL_TABS = [
    { key: "SPEAKING", label: "Speaking", icon: <AudioOutlined /> },
    { key: "LISTENING", label: "Listening", icon: <CustomerServiceOutlined /> },
    { key: "GRAMMAR AND VOCABULARY", label: "Grammar & Vocabulary", icon: <BookOutlined /> },
    { key: "READING", label: "Reading", icon: <ReadOutlined /> },
    { key: "WRITING", label: "Writing", icon: <EditOutlined /> },
];

const CreateExamPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { id: topicId } = useParams();

    const [selectedSkill, setSelectedSkill] = useState("SPEAKING");
    const [openModal, setOpenModal] = useState(false);
    const [selectedParts, setSelectedParts] = useState([]); // chỉ chứa ID section
    const [selectedSectionBySkill, setSelectedSectionBySkill] = useState({}); // chứa ID theo skill
    const [instructions, setInstructions] = useState([]); // chứa full section để hiển thị UI

    const { mutateAsync: createExam } = useCreateTopic();
    const { mutateAsync: createTopicSection } = useCreateTopicSection();
    const { data: topicData, isLoading } = useGetTopicWithRelations(topicId);
    const { mutateAsync: updateTopic } = useUpdateTopic();
    const { mutateAsync: updateTopicSection } = useUpdateTopicSection();

    const handlePartSelect = (sections) => {
        if (!sections || sections.length === 0) return;

        const section = sections[0];
        const sectionId = section.ID;

        // Lấy section cũ của skill này từ state hiện tại
        const oldSectionId = selectedSectionBySkill[selectedSkill];

        // --- Cập nhật selectedParts
        setSelectedParts((prevParts) => {
            const filtered = prevParts.filter(id => id !== oldSectionId);
            const updated = [...filtered, sectionId];
            console.log("Selected Parts after update:", updated);
            return [...filtered, sectionId];
        });

        // --- Cập nhật selectedSectionBySkill
        setSelectedSectionBySkill((prev) => ({
            ...prev,
            [selectedSkill]: sectionId,
        }));

        // --- Cập nhật instructions UI
        setInstructions((prev) => {
            const filtered = prev.filter(i => i.skill !== selectedSkill);
            return [...filtered, { skill: selectedSkill, section }];
        });

        setOpenModal(false);
    };

    const handleSaveExam = async () => {
        try {
            const values = form.getFieldsValue();
            if (!values.name) return message.error("Name is required");

            let topicResponse;
            if (topicId) {
                topicResponse = await updateTopic({ id: topicId, data: { Name: values.name } });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({ topicId: savedTopicId, data: { sectionIds: selectedParts } });

            } else {
                topicResponse = await createExam({ Name: values.name });
                const savedTopicId = topicResponse.ID || topicResponse._ID;

                if (!savedTopicId) return message.error("Cannot get topic ID");
                for (const sectionId of selectedParts) {
                    await createTopicSection({ topicId: savedTopicId, sectionId });
                }
            }

            message.success(topicId ? "Topic updated successfully!" : "Topic created successfully!");
            navigate("/exam");

        } catch (error) {
            console.error(error);
            message.error("Failed to save topic");
        }
    };

    const handleSubmitExam = async () => {
        try {
            const values = form.getFieldsValue();
            if (!values.name) return message.error("Name is required");

            let topicResponse;
            if (topicId) {
                topicResponse = await updateTopic({ id: topicId, data: { Name: values.name, Status: 'submited' } });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({ topicId: savedTopicId, data: { sectionIds: selectedParts } });

            } else {
                topicResponse = await createExam({ Name: values.name, Status: 'submited' });
                const savedTopicId = topicResponse.ID || topicResponse._ID;

                if (!savedTopicId) return message.error("Cannot get topic ID");
                for (const sectionId of selectedParts) {
                    await createTopicSection({ topicId: savedTopicId, sectionId });
                }
            }

            message.success(topicId ? "Topic updated successfully!" : "Topic created successfully!");
            navigate("/exam");

        } catch (error) {
            console.error(error);
            message.error("Failed to save topic");
        }
    };


    const renderSelectedSectionUI = () => {
        const data = instructions.find(ins => ins.skill === selectedSkill);
        if (!data) {
            return (
                <div
                    style={{
                        width: "100%",
                        height: 180,
                        border: "2px dashed #D1D5DB",
                        borderRadius: 12,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#9CA3AF",
                        fontSize: 16,
                        fontWeight: 500,
                    }}
                >
                    + Instruction
                </div>
            );
        }
        const { section } = data;

        return (
            <div style={{ width: "100%" }}>
                <Card
                    style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        background: "#FAFAFA",
                    }}
                    bodyStyle={{ padding: 16 }}
                >
                    <Text strong style={{ fontSize: 16 }}>{section.Name}</Text>
                    <br />
                    <Text type="secondary">{section.Description}</Text>

                    <div style={{ marginTop: 16 }}>
                        <div style={{ marginTop: 16 }}>
                            {(section.Parts || []).map((part) => (
                                <div
                                    key={part.ID}
                                    style={{
                                        marginBottom: 12,
                                        padding: 12,
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 8,
                                        background: "white",
                                    }}
                                >

                                    <Text strong>{part.Content}</Text>
                                    {!(selectedSkill === "READING" || selectedSkill === "WRITING") && (
                                        <>
                                            <br />
                                            <Text type="secondary">{part.SubContent}</Text>
                                        </>
                                    )}

                                    {!(selectedSkill === "READING" || selectedSkill === "WRITING") && (
                                        <div style={{ marginTop: 8 }}>
                                            {(part.Questions || []).map((q, index) => (
                                                <div
                                                    key={q.ID}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        gap: 12,
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: "50%",
                                                            background: "#0a2a79",
                                                            color: "white",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {(selectedSkill === "SPEAKING" && part.Content === "Part 4")
                                                            ? <span style={{ fontSize: 22, fontWeight: 700, marginTop: -2 }}>+</span>
                                                            : (index + 1)}
                                                    </div>

                                                    <Text style={{ fontSize: 15, lineHeight: "20px" }}>
                                                        {q.Content}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                </Card>
            </div>
        );
    };

    useEffect(() => {
        if (!topicData) return;
        form.setFieldsValue({ name: topicData.Name });
        const sectionsBySkill = {};
        const instructionsData = [];
        const selectedIds = [];

        (topicData.Sections || []).forEach(section => {
            const skill = section.Skill.Name;
            sectionsBySkill[skill] = section.ID;
            selectedIds.push(section.ID);
            instructionsData.push({ skill, section });
        });

        setSelectedSectionBySkill(sectionsBySkill);
        setInstructions(instructionsData);
        setSelectedParts(selectedIds);
    }, [topicData]);

    return (
        <>
            <HeaderInfo
                title={topicId ? "Edit Exam" : "Create New Exam"}
                subtitle={
                    topicId
                        ? "Modify exam information, structure, and skill-based questions."
                        : "Set up exam details, structure, and choose skill-based questions."
                }
            />

            <Form form={form} layout="vertical">
                <div style={{ padding: 24 }}>

                    <Card style={{ marginBottom: 24 }}>
                        <Title level={4}>Exam Information</Title>

                        <Form.Item
                            label="Exam Name"
                            name="name"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="Enter exam name" />
                        </Form.Item>
                    </Card>

                    <div
                        style={{
                            borderRadius: 12,
                            background: "#F5F6FA",
                            border: "1px solid #E5E7EB",
                            marginBottom: 20,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        }}
                    >
                        <div style={{ display: "flex", height: 40 }}>
                            {SKILL_TABS.map((tab) => {
                                const active = selectedSkill === tab.key;
                                return (
                                    <div
                                        key={tab.key}
                                        onClick={() => setSelectedSkill(tab.key)}
                                        style={{
                                            padding: "8px 18px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            background: active ? "#1677FF" : "white",
                                            color: active ? "white" : "#4B5563",
                                            border: active ? "1px solid #1677FF" : "1px solid #E5E7EB",
                                            boxShadow: active ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                                            transition: "0.2s",
                                        }}
                                    >
                                        {React.cloneElement(tab.icon, {
                                            style: { color: active ? "white" : "#6B7280" },
                                        })}
                                        <span style={{ fontWeight: 600 }}>{tab.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div
                            style={{
                                padding: "24px 24px 40px",
                                background: "white",
                                borderBottom: "1px solid #E5E7EB",
                                cursor: "pointer",
                            }}
                            onClick={() => setOpenModal(true)}
                        >
                            {renderSelectedSectionUI()}
                        </div>
                    </div>
                    <Divider />

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                        <Button>Start Exam Preview</Button>
                        <Space>
                            <Button onClick={() => navigate(-1)}>Cancel</Button>
                            <Button type="primary" onClick={handleSaveExam}>Save </Button>
                            <Button type="primary" onClick={handleSubmitExam}>Submit For Review</Button>
                        </Space>
                    </div>
                    <ChooseSectionModal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        skillName={selectedSkill}
                        onSelect={handlePartSelect}
                        selectedSectionId={selectedSectionBySkill[selectedSkill]}
                    />

                </div>
            </Form>
        </>
    );
};

export default CreateExamPage;
