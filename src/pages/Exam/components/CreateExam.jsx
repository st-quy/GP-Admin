// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from "react";
import HeaderInfo from '@app/components/HeaderInfo';
import {
    AudioOutlined,
    ReadOutlined,
    EditOutlined,
    BookOutlined,
    CustomerServiceOutlined,
    HolderOutlined,
    LeftOutlined,
    EyeOutlined,
    PlusOutlined,
    CheckOutlined
} from "@ant-design/icons";
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    Typography,
    Divider,
    message,
    DatePicker,
    Modal,
    Spin,
    Layout,
    Row,
    Col
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCreateTopic, useCreateTopicSection, useGetTopicWithRelations, useUpdateTopic, useUpdateTopicSection } from "@features/topic/hooks";
import ChooseSectionModal from "@features/topic/ui/ChooseSectionModal";
import PreviewExam from "@shared/ui/PreviewExam";
import { useSelector } from "react-redux";
import useConfirm from "@shared/hook/useConfirm";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const SortableQuestionItem = ({ id, children }) => {
    const { setNodeRef, listeners, attributes, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children(listeners, attributes)}
        </div>
    );
};

const { Content } = Layout;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const SKILL_TABS = [
    { key: "SPEAKING", label: "Speaking", icon: <AudioOutlined /> },
    { key: "LISTENING", label: "Listening", icon: <CustomerServiceOutlined /> },
    { key: "READING", label: "Reading", icon: <ReadOutlined /> },
    { key: "WRITING", label: "Writing", icon: <EditOutlined /> },
    { key: "GRAMMAR AND VOCABULARY", label: "Grammar & Vocabulary", icon: <BookOutlined /> },
];

const SectionSelectModal = ({ open, onCancel, onSelect, selectedSkill, initialSelectedIds = [] }) => {
    const { data: sections, isLoading } = useGetTopicWithRelations(selectedSkill);
    const [localSelectedIds, setLocalSelectedIds] = useState(initialSelectedIds);

    useEffect(() => {
        if (open) setLocalSelectedIds(initialSelectedIds);
    }, [open, initialSelectedIds]);

    const handleToggle = (id) => {
        setLocalSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <Modal
            title={`Select ${selectedSkill} Sections`}
            open={open}
            onCancel={onCancel}
            onOk={() => onSelect(localSelectedIds)}
            width={800}
        >
            <Spin spinning={isLoading}>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {sections?.data?.map(section => (
                        <Card
                            key={section.ID}
                            size="small"
                            style={{ marginBottom: 12, cursor: 'pointer', borderColor: localSelectedIds.includes(section.ID) ? '#1890ff' : '#f0f0f0' }}
                            onClick={() => handleToggle(section.ID)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>{section.Name}</Text>
                                    <br />
                                    <Text type="secondary">{section.Description || "No description"}</Text>
                                </div>
                                <Button type={localSelectedIds.includes(section.ID) ? "primary" : "default"} shape="circle" icon={localSelectedIds.includes(section.ID) ? <CheckOutlined /> : <PlusOutlined />} />
                            </div>
                        </Card>
                    ))}
                </div>
            </Spin>
        </Modal>
    );
};

const CreateExamPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [selectedSkill, setSelectedSkill] = useState("SPEAKING");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmLeave, setShowConfirmLeave] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // useQuery
    const { data: topicData, isLoading: isTopicLoading } = useGetTopicWithRelations(id, { enabled: !!id });

    // useMutation
    const createTopic = useCreateTopic();
    const updateTopic = useUpdateTopic();
    const createTopicSection = useCreateTopicSection();
    const updateTopicSection = useUpdateTopicSection();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => {
        if (topicData?.data) {
            form.setFieldsValue({
                Name: topicData.data.Name,
                ShuffleQuestions: topicData.data.ShuffleQuestions,
                ShuffleAnswers: topicData.data.ShuffleAnswers,
            });
        }
    }, [topicData, form]);

    const handleFormChange = () => setIsDirty(true);

    const onFinish = async (values) => {
        try {
            setIsSaving(true);
            let topicId = id;

            if (!id) {
                const res = await createTopic.mutateAsync(values);
                topicId = res.data.ID;
            } else {
                await updateTopic.mutateAsync({ id, payload: values });
            }

            message.success(id ? "Exam updated successfully" : "Exam created successfully");
            setIsDirty(false);
            if (!id) navigate(`/exam/edit/${topicId}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDragEnd = (event, sectionId) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            // Reorder questions logic (client-side state or API call)
        }
    };

    const renderInstructionContent = () => {
        const sections = topicData?.data?.Sections?.filter(s => s.Parts?.[0]?.Skill?.Name === selectedSkill) || [];

        if (sections.length === 0) {
            return (
                <div style={{ width: "100%", height: 180, border: "2px dashed #D1D5DB", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", color: "#9CA3AF", fontSize: 16, fontWeight: 500 }}>
                    No instructions added for this skill yet.
                </div>
            );
        }

        return sections.map((section) => (
            <Card
                key={section.ID}
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <HolderOutlined style={{ cursor: "grab", color: "#9CA3AF" }} />
                        <Text strong>{section.Name}</Text>
                    </div>
                }
                extra={<Button type="link" danger>Remove</Button>}
                style={{ marginBottom: 16, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
                {section.Parts?.map((part) => (
                    <div key={part.ID} style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Text strong>{part.Content}</Text>
                                {part.SubContent && (
                                    <Tag color="blue" style={{ borderRadius: 4 }}>{part.SubContent}</Tag>
                                )}
                            </div>
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, section.ID)} modifiers={[restrictToVerticalAxis]}>
                            <SortableContext items={part.Questions.map(q => q.ID)} strategy={verticalListSortingStrategy}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {part.Questions.map((q, index) => (
                                        <SortableQuestionItem key={q.ID} id={q.ID}>
                                            {(listeners, attributes) => (
                                                <div
                                                    {...attributes}
                                                    {...listeners}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        gap: 12,
                                                        padding: "12px 16px",
                                                        background: "#F9FAFB",
                                                        borderRadius: 8,
                                                        border: "1px solid #F3F4F6",
                                                        transition: "all 0.2s"
                                                    }}
                                                >
                                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a2a79", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                                                        {index + 1}
                                                    </div>
                                                    <Text style={{ fontSize: 15, lineHeight: "20px" }}>{q.Content}</Text>
                                                </div>
                                            )}
                                        </SortableQuestionItem>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                ))}
            </Card>
        ));
    };

    return (
        <>
            <HeaderInfo
                title={id ? "Edit Exam" : "Create New Exam"}
                subtitle={id ? "Update exam settings and questions" : "Set up a new examination for your classes"}
                SubAction={
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => navigate("/exam")}
                        className="!rounded-full"
                    >
                        Back
                    </Button>
                }
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleFormChange}
                initialValues={{ ShuffleQuestions: false, ShuffleAnswers: false }}
            >
                <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                    <Row gutter={24}>
                        <Col xs={24} lg={8}>
                            <Card title="General Settings" style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                                <Form.Item
                                    label="Exam Name"
                                    name="Name"
                                    rules={[{ required: true, message: "Please enter exam name" }]}
                                >
                                    <Input placeholder="Mid-term Test 2024" size="large" />
                                </Form.Item>

                                <Divider />

                                <Form.Item label="Randomization" style={{ marginBottom: 0 }}>
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Form.Item name="ShuffleQuestions" valuePropName="checked" style={{ marginBottom: 8 }}>
                                            <Button block type={form.getFieldValue("ShuffleQuestions") ? "primary" : "default"} onClick={() => { form.setFieldsValue({ ShuffleQuestions: !form.getFieldValue("ShuffleQuestions") }); setIsDirty(true); }}>
                                                Shuffle Questions
                                            </Button>
                                        </Form.Item>
                                        <Form.Item name="ShuffleAnswers" valuePropName="checked">
                                            <Button block type={form.getFieldValue("ShuffleAnswers") ? "primary" : "default"} onClick={() => { form.setFieldsValue({ ShuffleAnswers: !form.getFieldValue("ShuffleAnswers") }); setIsDirty(true); }}>
                                                Shuffle Answers
                                            </Button>
                                        </Form.Item>
                                    </Space>
                                </Form.Item>
                            </Card>

                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<EyeOutlined />}
                                style={{ marginTop: 24, height: 50, borderRadius: 12, background: "#0a2a79" }}
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                Preview Exam
                            </Button>
                        </Col>

                        <Col xs={24} lg={16}>
                            <Card
                                title="Exam Content"
                                style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                                tabList={SKILL_TABS}
                                activeTabKey={selectedSkill}
                                onTabChange={setSelectedSkill}
                                tabBarExtraContent={
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-primaryColor"
                                    >
                                        Add Section
                                    </Button>
                                }
                            >
                                <Spin spinning={isTopicLoading}>
                                    {renderInstructionContent()}
                                </Spin>
                            </Card>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                                <Space size="middle">
                                    <Button size="large" style={{ borderRadius: 8, width: 120 }}>Cancel</Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        loading={isSaving}
                                        onClick={() => form.submit()}
                                        style={{ borderRadius: 8, width: 120, background: "#0a2a79" }}
                                    >
                                        {id ? "Update" : "Create"}
                                    </Button>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                </Content>
            </Form>

            <SectionSelectModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                selectedSkill={selectedSkill}
                onSelect={(ids) => {
                    console.log("Selected IDs:", ids);
                    setIsModalOpen(false);
                }}
            />

            {isPreviewOpen && (
                <PreviewExam
                    isModalOpen={isPreviewOpen}
                    setIsModalOpen={setIsPreviewOpen}
                    dataExam={topicData?.data}
                />
            )}

            <Modal
                title="Unsaved Changes"
                open={showConfirmLeave}
                onCancel={() => setShowConfirmLeave(false)}
                footer={[
                    <Button key="leave" onClick={() => navigate("/exam")}>Leave Without Saving</Button>,
                    <Button key="save" type="primary" loading={isSaving} onClick={() => { form.submit(); navigate("/exam"); }}>Save and Leave</Button>,
                ]}
            >
                <p>You have unsaved changes. Would you like to save them before leaving?</p>
            </Modal>
        </>
    );
};

export default CreateExamPage;
