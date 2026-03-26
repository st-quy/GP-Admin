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
    EyeOutlined
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
    Spin
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

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

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
    const location = useLocation();
    const isViewMode = location.pathname.includes("/exam/view");

    const [selectedSkill, setSelectedSkill] = useState("SPEAKING");
    const [openModal, setOpenModal] = useState(false);
    const [selectedParts, setSelectedParts] = useState([]);
    const [selectedSectionBySkill, setSelectedSectionBySkill] = useState({});
    const [instructions, setInstructions] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const { openConfirmModal, ModalComponent } = useConfirm();
    const [isDirty, setIsDirty] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const pendingPath = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );
    const { mutateAsync: createExam } = useCreateTopic();
    const { mutateAsync: createTopicSection } = useCreateTopicSection();
    const { data: topicData, isLoading } = useGetTopicWithRelations(topicId);
    const { mutateAsync: updateTopic } = useUpdateTopic();
    const { mutateAsync: updateTopicSection } = useUpdateTopicSection();
    const { role, user } = useSelector((state) => state.auth);

    // Robust check for admin role
    const isAdmin = Array.isArray(role)
        ? role.some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'superadmin')
        : (typeof role === 'string' && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'));

    const handleApprove = async () => {
        openConfirmModal({
            title: 'Approve Exam',
            message: `Are you sure you want to approve this exam? This will make it available for students.`,
            okText: 'Approve',
            okButtonColor: '#52c41a',
            onConfirm: async () => {
                try {
                    await updateTopic({ id: topicId, data: { Status: 'approved' } });
                    message.success("Exam approved successfully!");
                    navigate("/exam");
                } catch (error) {
                    message.error("Failed to approve exam");
                }
            },
        });
    };

    const handleReject = async () => {
        openConfirmModal({
            title: 'Reject Exam',
            message: `Are you sure you want to reject this exam? The teacher will need to review and submit it again.`,
            okText: 'Reject',
            okButtonColor: '#FF4D4F',
            onConfirm: async () => {
                try {
                    await updateTopic({
                        id: topicId,
                        data: { Status: 'rejected', ReasonReject: null }
                    });
                    message.success("Exam rejected successfully!");
                    navigate("/exam");
                } catch (error) {
                    message.error("Failed to reject exam");
                }
            },
        });
    };

    const handleNavigateAway = useCallback((path = '/exam') => {
        if (isDirty && !isViewMode) {
            pendingPath.current = path;
            setLeaveConfirmOpen(true);
        } else {
            navigate(path);
        }
    }, [isDirty, isViewMode, navigate]);

    const handleSaveExam = async () => {
        try {
            const values = await form.validateFields(['name']);
            let topicResponse;
            if (topicId) {
                topicResponse = await updateTopic({ id: topicId, data: { Name: values.name.trim(), Status: 'draft' } });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({ topicId: savedTopicId, data: { sectionIds: selectedParts } });
            } else {
                topicResponse = await createExam({ Name: values.name, Status: 'draft' });
                const savedTopicId = topicResponse.ID || topicResponse._ID;
                if (!savedTopicId) return message.error("Cannot get topic ID");
                for (const sectionId of selectedParts) {
                    await createTopicSection({ topicId: savedTopicId, sectionId });
                }
            }
            message.success("Topic saved successfully!");
            setIsDirty(false);
            navigate("/exam");
        } catch (error) {
            console.error(error);
            message.error("Failed to save topic");
        }
    };

    const handleSubmitExam = async () => {
        if (instructions.length < 5) {
            message.warning("Please select all skills before submitting");
            return;
        }
        try {
            const values = await form.validateFields();
            let topicResponse;
            if (topicId) {
                topicResponse = await updateTopic({ id: topicId, data: { Name: values.name.trim(), Status: 'submited' } });
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
            message.success("Topic submitted successfully!");
            setIsDirty(false);
            navigate("/exam");
        } catch (error) {
            console.error(error);
            message.error("Failed to submit topic");
        }
    };

    const saveDraftAndLeave = async () => {
        await handleSaveExam();
        setLeaveConfirmOpen(false);
    };

    const discardAndLeave = () => {
        setIsDirty(false);
        setLeaveConfirmOpen(false);
        navigate(pendingPath.current || '/exam');
    };

    const handlePartSelect = (sections) => {
        setIsDirty(true);
        const oldSectionId = selectedSectionBySkill[selectedSkill];
        if (!sections || sections.length === 0) {
            setSelectedParts((prev) => prev.filter((id) => id !== oldSectionId));
            setSelectedSectionBySkill((prev) => {
                const copy = { ...prev };
                delete copy[selectedSkill];
                return copy;
            });
            setInstructions((prev) => prev.filter((i) => i.skill !== selectedSkill));
            setOpenModal(false);
            return;
        }
        const section = sections[0];
        const sectionId = section.ID;
        setSelectedParts((prev) => {
            const filtered = prev.filter((id) => id !== oldSectionId);
            return [...filtered, sectionId];
        });
        setSelectedSectionBySkill((prev) => ({ ...prev, [selectedSkill]: sectionId }));
        setInstructions((prev) => {
            const filtered = prev.filter((i) => i.skill !== selectedSkill);
            return [...filtered, { skill: selectedSkill, section }];
        });
        setOpenModal(false);
    };

    const handlePreviewExam = () => {
        if (!instructions.length) {
            message.warning("Please select at least one skill before preview");
            return;
        }
        const skillOrder = ["LISTENING", "GRAMMAR AND VOCABULARY", "READING", "WRITING", "SPEAKING"];
        const skills = skillOrder.map(skillName => {
            const found = instructions.find(i => i.skill === skillName);
            if (!found || !found.section) return { ID: null, Name: skillName, Parts: [] };
            return {
                ID: found.section.SkillID || found.section.Skill?.ID,
                Name: skillName,
                Parts: found.section.Parts || [],
            };
        });
        const previewExamData = {
            ID: topicData?.ID,
            Name: form.getFieldValue("name"),
            Skills: skills,
            createdAt: topicData?.createdAt || new Date().toISOString(),
            updatedAt: topicData?.updatedAt || new Date().toISOString(),
        };
        setPreviewData(previewExamData);
        setPreviewOpen(true);
    };

    const handleSaveExam = async () => {
        try {
            const values = form.getFieldsValue();
            if (!values.name || !values.name.trim()) return message.error("Exam name is required");

            const finalScores = { ...questionScores };
            instructions.forEach(({ skill, section }) => {
                const sectionQuestions = [];
                (section.Parts || []).forEach(p => {
                    (p.Questions || []).forEach(q => sectionQuestions.push(q.ID));
                });
                const total = sectionQuestions.reduce((acc, qid) => acc + (finalScores[qid] || 0), 0);
                const maxAllowed = ["SPEAKING", "WRITING"].includes(skill) ? 50 : 20;
                if (total > maxAllowed) {
                    const ratio = maxAllowed / total;
                    sectionQuestions.forEach(qid => {
                        if (finalScores[qid]) finalScores[qid] = parseFloat((finalScores[qid] * ratio).toFixed(2));
                    });
                }
            });

            let topicResponse;
            if (topicId) {
                topicResponse = await updateTopic({
                    id: topicId,
                    data: { Name: values.name.trim(), Status: 'draft', Duration: values.duration || null, ShuffleQuestions, ShuffleAnswers }
                });
                await updateTopicSection({
                    topicId: topicResponse.ID || topicId,
                    data: { sectionIds: selectedParts, scoreConfig: finalScores }
                });
            } else {
                topicResponse = await createExam({
                    Name: values.name.trim(), Status: 'draft', Duration: values.duration || null, ShuffleQuestions, ShuffleAnswers
                });
                await updateTopicSection({
                    topicId: topicResponse.ID,
                    data: { sectionIds: selectedParts, scoreConfig: finalScores }
                });
            }
            setIsDirty(false);
            message.success("Topic saved successfully!");
            navigate("/exam");
        } catch (error) {
            message.error("Failed to save topic");
        }
    };

    const handleSubmitExam = async () => {
        if (instructions.length < 5) return message.warning("Please select all 5 skills before submitting");
        try {
            const values = form.getFieldsValue();
            const finalScores = { ...questionScores };
            instructions.forEach(({ skill, section }) => {
                const sectionQuestions = [];
                (section.Parts || []).forEach(p => {
                    (p.Questions || []).forEach(q => sectionQuestions.push(q.ID));
                });
                const total = sectionQuestions.reduce((acc, qid) => acc + (finalScores[qid] || 0), 0);
                const maxAllowed = ["SPEAKING", "WRITING"].includes(skill) ? 50 : 20;
                if (total > maxAllowed) {
                    const ratio = maxAllowed / total;
                    sectionQuestions.forEach(qid => {
                        if (finalScores[qid]) finalScores[qid] = parseFloat((finalScores[qid] * ratio).toFixed(2));
                    });
                }
            });

            await updateTopic({
                id: topicId,
                data: { Name: values.name.trim(), Status: 'submited', Duration: values.duration || null, ShuffleQuestions, ShuffleAnswers }
            });
            await updateTopicSection({
                topicId,
                data: { sectionIds: selectedParts, scoreConfig: finalScores }
            });
            setIsDirty(false);
            message.success("Topic submitted successfully!");
            navigate("/exam");
        } catch (error) {
            message.error("Failed to submit topic");
        }
    };

    const handleScoreChange = (questionId, score) => {
        setQuestionScores(prev => ({ ...prev, [questionId]: score }));
        setIsDirty(true);
    };

    const discardAndLeave = () => {
        setIsDirty(false);
        setLeaveConfirmOpen(false);
        navigate(pendingPath.current);
    };

    const saveDraftAndLeave = async () => {
        await handleSaveExam();
        setLeaveConfirmOpen(false);
    };

    const renderInstructionContent = () => {
        const found = instructions.find((i) => i.skill === selectedSkill);
        if (!found) {
            return (
                <div style={{ width: "100%", height: 180, border: "2px dashed #D1D5DB", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", color: "#9CA3AF", fontSize: 16, fontWeight: 500 }}>
                    + Instruction
                </div>
            );
        }
        const { section } = data;
        return (
            <div style={{ width: "100%" }}>
                <Card style={{ border: "1px solid #E5E7EB", borderRadius: 12, background: "#FAFAFA" }} bodyStyle={{ padding: 16 }}>
                    <Text strong style={{ fontSize: 16 }}>{section.Name}</Text>
                    <br />
                    <Text type="secondary">{section.Description}</Text>
                    <div style={{ marginTop: 16 }}>
                        {(section.Parts || []).map((part) => (
                            <div key={part.ID} style={{ marginBottom: 12, padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, background: "white" }}>
                                <Text strong>{part.Content}</Text>
                                {!(selectedSkill === "READING" || selectedSkill === "WRITING") && (
                                    <>
                                        <br />
                                        <Text type="secondary">{part.SubContent}</Text>
                                    </>
                                )}
                                {!(selectedSkill === "READING" || selectedSkill === "WRITING") && (
                                    <div style={{ marginTop: 8 }}>
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={(event) => {
                                            if (isViewMode) return;
                                            const { active, over } = event;
                                            if (!over || active.id === over.id) return;
                                            const questions = [...(part.Questions || [])];
                                            const oldIdx = questions.findIndex(q => q.ID === active.id);
                                            const newIdx = questions.findIndex(q => q.ID === over.id);
                                            if (oldIdx === -1 || newIdx === -1) return;
                                            const [moved] = questions.splice(oldIdx, 1);
                                            questions.splice(newIdx, 0, moved);
                                            setInstructions(prev => prev.map(ins => {
                                                if (ins.skill !== selectedSkill) return ins;
                                                return {
                                                    ...ins,
                                                    section: {
                                                        ...ins.section,
                                                        Parts: (ins.section.Parts || []).map(p => p.ID === part.ID ? { ...p, Questions: questions } : p),
                                                    },
                                                };
                                            }));
                                        }}>
                                            <SortableContext items={(part.Questions || []).map(q => q.ID)} strategy={verticalListSortingStrategy}>
                                                {(part.Questions || []).map((q, index) => (
                                                    <SortableQuestionItem key={q.ID} id={q.ID}>
                                                        {(listeners, attributes) => (
                                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10, padding: 8, borderRadius: 8, background: "#fff", border: "1px solid transparent" }}>
                                                                {!isViewMode && <HolderOutlined {...listeners} {...attributes} style={{ cursor: "grab", color: "#999", fontSize: 16, marginTop: 4, flexShrink: 0 }} />}
                                                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a2a79", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                                                                    {(selectedSkill === "SPEAKING" && part.Content === "Part 4") ? <span style={{ fontSize: 22, fontWeight: 700, marginTop: -2 }}>+</span> : (index + 1)}
                                                                </div>
                                                                <Text style={{ fontSize: 15, lineHeight: "20px" }}>{q.Content}</Text>
                                                            </div>
                                                        )}
                                                    </SortableQuestionItem>
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    };

    useEffect(() => {
        if (user && !topicId) {
            const creatorName = [user.firstName, user.lastName].filter(Boolean).join(' ');
            form.setFieldsValue({ creator: creatorName });
        }
    }, [user, form, topicId]);

    useEffect(() => {
        if (!topicData) return;
        form.setFieldsValue({ name: topicData.Name, duration: topicData.Duration });
        setShuffleQuestions(!!topicData.ShuffleQuestions);
        setShuffleAnswers(!!topicData.ShuffleAnswers);

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
        setIsDirty(false);
    }, [topicData]);

    return (
        <>
            <ModalComponent />
            <HeaderInfo
                title={isViewMode ? "View Exam Details" : topicId ? "Edit Exam" : "Create New Exam"}
                subtitle={isViewMode ? "Preview the exam information and structure. Editing is disabled." : topicId ? "Modify exam information, structure, and skill-based questions." : "Set up exam details, structure, and choose skill-based questions."}
                actions={
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Button icon={<LeftOutlined />} onClick={() => navigate("/exam")}>Back</Button>
                        <Button icon={<EyeOutlined />} onClick={handlePreviewExam}>Preview</Button>
                        {isViewMode && topicData?.Status === 'submited' && isAdmin && (
                            <>
                                <Button type="primary" style={{ background: "#52c41a", borderColor: "#52c41a" }} onClick={handleApprove}>Approve</Button>
                                <Button danger type="primary" onClick={handleReject}>Reject</Button>
                            </>
                        )}
                    </div>
                }
            />
            <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                <Spin spinning={isLoading}>
                    <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
                        <Card title="Settings" style={{ marginBottom: 24, borderRadius: 12 }}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item label="Exam Name" name="name" rules={[{ required: true }]}>
                                        <Input placeholder="Exam name..." size="large" disabled={isViewMode} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Duration (minutes)" name="duration">
                                        <InputNumber min={1} max={999} placeholder="e.g. 60" disabled={isViewMode} size="large" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            {!isViewMode && (
                                <div style={{ padding: '16px', background: '#f0f5ff', borderRadius: 8 }}>
                                    <Title level={5}><SwapOutlined /> Randomization Settings</Title>
                                    <Row gutter={48}>
                                        <Col>
                                            <Space>
                                                <Switch checked={shuffleQuestions} onChange={(v) => { setShuffleQuestions(v); setIsDirty(true); }} disabled={selectedSkill !== "GRAMMAR AND VOCABULARY"} />
                                                <Text strong>Shuffle Questions {selectedSkill !== "GRAMMAR AND VOCABULARY" && "(Fixed)"}</Text>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Switch checked={shuffleAnswers} onChange={(v) => { setShuffleAnswers(v); setIsDirty(true); }} disabled={!["GRAMMAR AND VOCABULARY", "LISTENING", "READING"].includes(selectedSkill)} />
                                                <Text strong>Shuffle Answers</Text>
                                            </Space>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                            <Form.Item label="Exam Name" name="name" getValueFromEvent={(e) => e.target.value.replace(/[^a-zA-Z0-9 ,.\-_:]/g, '')} rules={[{ required: true }]}>
                                <Input maxLength={255} placeholder="Enter exam name" disabled={isViewMode} />
                            </Form.Item>
                            <Form.Item label={"Creator"} name="creator"><Input disabled /></Form.Item>
                            <Form.Item label={"Last Edited By"} name="editor"><Input placeholder="None" disabled /></Form.Item>
                            <Form.Item label="Duration" name="duration" rules={[{ required: true }]}>
                                <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" disabled={isViewMode} />
                            </Form.Item>
                        </Card>

                        <div style={{ borderRadius: 12, background: "#F5F6FA", border: "1px solid #E5E7EB", marginBottom: 20, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", height: 40 }}>
                                {SKILL_TABS.map((tab) => {
                                    const active = selectedSkill === tab.key;
                                    return (
                                        <div key={tab.key} onClick={() => setSelectedSkill(tab.key)} style={{ padding: "8px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: active ? "#1677FF" : "white", color: active ? "white" : "#4B5563", border: active ? "1px solid #1677FF" : "1px solid #E5E7EB", boxShadow: active ? "0 2px 6px rgba(0,0,0,0.15)" : "none", transition: "0.2s" }}>
                                            {React.cloneElement(tab.icon, { style: { color: active ? "white" : "#6B7280" } })}
                                            <span style={{ fontWeight: 600 }}>{tab.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ padding: "24px 24px 40px", background: "white", borderBottom: "1px solid #E5E7EB", cursor: "pointer" }} onClick={() => { if (!isViewMode) setOpenModal(true) }}>
                                {renderSelectedSectionUI()}
                            </div>
                        </div>
                        <Divider />

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                            <Button type="primary" onClick={handlePreviewExam}>Start Exam Preview</Button>
                            <Space>
                                <Button onClick={() => handleNavigateAway('/exam')}>Cancel</Button>
                                {!isViewMode && (
                                    <>
                                        <Button type="primary" onClick={handleSaveExam}>Save As Draft</Button>
                                        <Button type="primary" onClick={handleSubmitExam}>Submit For Review</Button>
                                    </>
                                )}
                            </Space>
                        </div>
                        <ChooseSectionModal open={openModal} onClose={() => setOpenModal(false)} skillName={selectedSkill} onSelect={handlePartSelect} selectedSectionId={selectedSectionBySkill[selectedSkill]} />
                    </div>
                    <PreviewExam isModalOpen={previewOpen} setIsModalOpen={setPreviewOpen} dataExam={previewData} fileData={null} setDataExam={setPreviewData} />
                    <ModalComponent />
                    <Modal title="You have unsaved changes" open={leaveConfirmOpen} onCancel={() => setLeaveConfirmOpen(false)} footer={[
                        <Button key="discard" danger onClick={discardAndLeave}>Leave without Saving</Button>,
                        <Button key="save" type="primary" onClick={saveDraftAndLeave}>Save as Draft & Leave</Button>,
                        <Button key="stay" onClick={() => setLeaveConfirmOpen(false)}>Stay on Page</Button>,
                    ]}>
                        <p>Would you like to save your work as a draft before leaving?</p>
                    </Modal>
                </Form>
            </>
            );
};

            export default CreateExamPage;
