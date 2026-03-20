// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
    LeftOutlined,
    CustomerServiceOutlined,
    BookOutlined,
    ReadOutlined,
    EditOutlined,
    AudioOutlined,
    EyeOutlined,
    SaveOutlined,
    SendOutlined,
    PlusOutlined,
    SwapOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Layout,
    Row,
    Tabs,
    Typography,
    Modal,
    Checkbox,
    Space,
    message,
    Spin,
    InputNumber,
    Switch,
    Tag,
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import HeaderInfo from "@app/components/HeaderInfo";
import { useGetSections } from "@features/section/hooks";
import {
    useCreateTopic,
    useGetTopicWithRelations,
    useUpdateTopic,
    useCreateTopicSection,
    useUpdateTopicSection,
} from "@features/topic/hooks";
import useConfirm from "@shared/hook/useConfirm";
import PreviewExamModal from "@shared/ui/PreviewExam";
import RejectExamModal from "@features/topic/ui/RejectModal";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
const { Content } = Layout;

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
    const isEditMode = location.pathname.includes("/exam/edit");

    const [selectedSkill, setSelectedSkill] = useState("SPEAKING");
    const [openModal, setOpenModal] = useState(false);
    const [selectedParts, setSelectedParts] = useState([]); 
    const [selectedSectionBySkill, setSelectedSectionBySkill] = useState({}); 
    const [instructions, setInstructions] = useState([]); 
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const { openConfirmModal, ModalComponent } = useConfirm();
    const [rejectOpen, setRejectOpen] = useState(false);
    
    // Dirty Check States (from develop)
    const [isDirty, setIsDirty] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const pendingPath = useRef(null);

    // Shuffle & Score States
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [shuffleAnswers, setShuffleAnswers] = useState(false);
    const [questionScores, setQuestionScores] = useState({});

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const { mutateAsync: createExam } = useCreateTopic();
    const { mutateAsync: createTopicSection } = useCreateTopicSection();
    const { data: topicData, isLoading } = useGetTopicWithRelations(topicId);
    const { mutateAsync: updateTopic } = useUpdateTopic();
    const { mutateAsync: updateTopicSection } = useUpdateTopicSection();
    const { role, user } = useSelector((state) => state.auth);

    const handlePartSelect = (sections) => {
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
            setIsDirty(true);
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
        setIsDirty(true);
    };

    const handlePreview = () => {
        if (instructions.length === 0) {
            message.warning("Please select at least one skill to preview.");
            return;
        }
        const skillsOrder = ["SPEAKING", "LISTENING", "GRAMMAR AND VOCABULARY", "READING", "WRITING"];
        const skills = skillsOrder.map(skillName => {
            const found = instructions.find(i => i.skill === skillName);
            if (!found) return { ID: skillName, Name: skillName, Parts: [] };
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
                    data: { Name: values.name.trim(), Status: 'draft', ShuffleQuestions, ShuffleAnswers }
                });
                await updateTopicSection({
                    topicId: topicResponse.ID || topicId,
                    data: { sectionIds: selectedParts, scoreConfig: finalScores }
                });
            } else {
                topicResponse = await createExam({
                    Name: values.name.trim(), Status: 'draft', ShuffleQuestions, ShuffleAnswers
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
                data: { Name: values.name.trim(), Status: 'submited', ShuffleQuestions, ShuffleAnswers }
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
                <div style={{ textAlign: "center", padding: "40px 0", background: "#f9f9f9", borderRadius: 8, border: "1px dashed #d9d9d9" }}>
                    <Text type="secondary">No section selected for this skill yet.</Text>
                    <div style={{ marginTop: 16 }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenModal(true)}>Select Section</Button>
                    </div>
                </div>
            );
        }

        const { section } = found;
        const sectionTotalScore = (section.Parts || []).reduce((acc, p) => {
            return acc + (p.Questions || []).reduce((qAcc, q) => qAcc + (questionScores[q.ID] || 0), 0);
        }, 0);
        const maxScore = ["SPEAKING", "WRITING"].includes(selectedSkill) ? 50 : 20;

        return (
            <Card
                style={{ borderRadius: 12, background: "#FAFAFA" }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>{section.Name}</Text>
                            <div style={{ marginTop: 4 }}>
                                <Text strong style={{ color: sectionTotalScore > maxScore ? '#faad14' : '#1677ff' }}>
                                    Total Section Score: {sectionTotalScore.toFixed(2)}
                                    {sectionTotalScore > maxScore && <span style={{ color: '#ff4d4f' }}> (Will be capped at {maxScore.toFixed(2)})</span>}
                                </Text>
                            </div>
                        </div>
                        {!isViewMode && <Button type="dashed" onClick={() => setOpenModal(true)}>Change Section</Button>}
                    </div>
                }
            >
                {(section.Parts || []).map((part) => (
                    <div key={part.ID} style={{ marginBottom: 12, padding: 12, border: "1px solid #E5E7EB", borderRadius: 8, background: "white" }}>
                        <Text strong>{part.Content}</Text>
                        <div style={{ marginTop: 8 }}>
                            {(part.Questions || []).map((q, index) => (
                                <div key={q.ID} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 16, borderBottom: '1px dashed #f0f0f0', paddingBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0a2a79", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{index + 1}</div>
                                        <Text style={{ flex: 1 }}>{q.Content}</Text>
                                        {shuffleAnswers && q.Type === 'multiple-choice' && <Tag color="orange" style={{ fontSize: 10 }}>Answers will be shuffled</Tag>}
                                    </div>
                                    {!isViewMode ? (
                                        <div style={{ minWidth: 140 }}>
                                            <div style={{ fontSize: 11, color: '#999' }}>Score (pts)</div>
                                            <InputNumber min={0} max={50} step={0.1} value={questionScores[q.ID] || 0} onChange={(val) => handleScoreChange(q.ID, val)} style={{ width: '100%' }} controls={false} />
                                        </div>
                                    ) : (
                                        <Tag color="blue">{questionScores[q.ID] || 0} pts</Tag>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </Card>
        );
    };

    useEffect(() => {
        if (!topicData) return;
        form.setFieldsValue({ name: topicData.Name });
        setShuffleQuestions(!!topicData.ShuffleQuestions);
        setShuffleAnswers(!!topicData.ShuffleAnswers);
        
        const sectionsBySkill = {};
        const instructionsData = [];
        const selectedIds = [];
        const scores = {};

        (topicData.Sections || []).forEach(section => {
            const skill = section.Skill.Name;
            sectionsBySkill[skill] = section.ID;
            selectedIds.push(section.ID);
            instructionsData.push({ skill, section });
            const config = section.TopicSection?.ScoreConfig || section.TopicSection?.scoreConfig;
            if (config) Object.assign(scores, config);
        });

        setSelectedSectionBySkill(sectionsBySkill);
        setInstructions(instructionsData);
        setSelectedParts(selectedIds);
        setQuestionScores(scores);
        setIsDirty(false);
    }, [topicData]);

    return (
        <>
            <HeaderInfo
                title={isViewMode ? "View Exam" : topicId ? "Edit Exam" : "Create Exam"}
                actions={
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Button icon={<LeftOutlined />} onClick={() => navigate("/exam")}>Back</Button>
                        <Button icon={<EyeOutlined />} onClick={handlePreview}>Preview</Button>
                        {!isViewMode && (
                            <>
                                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveExam} style={{ background: "#52c41a", borderColor: "#52c41a" }}>Save Draft</Button>
                                <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitExam}>Submit</Button>
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
                        </Card>
                        <Card title="Content" bodyStyle={{ padding: 0 }} style={{ borderRadius: 12 }}>
                            <Tabs activeKey={selectedSkill} onChange={setSelectedSkill} centered items={SKILL_TABS.map((tab) => ({
                                key: tab.key,
                                label: <span>{tab.icon} {tab.label}</span>,
                                children: <div style={{ padding: "24px" }}>{renderInstructionContent()}</div>
                            }))} />
                        </Card>
                        {!isViewMode && (
                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <Button size="large" onClick={() => navigate("/exam")}>Cancel</Button>
                                <Button size="large" type="primary" icon={<SaveOutlined />} onClick={handleSaveExam} style={{ background: "#52c41a" }}>Save Draft</Button>
                                <Button size="large" type="primary" icon={<SendOutlined />} onClick={handleSubmitExam}>Submit Exam</Button>
                            </div>
                        )}
                    </Form>
                </Spin>
            </Content>
            <SectionSelectModal open={openModal} onCancel={() => setOpenModal(false)} onSelect={handlePartSelect} selectedSkill={selectedSkill} initialSelectedIds={selectedSectionBySkill[selectedSkill] ? [selectedSectionBySkill[selectedSkill]] : []} />
            <PreviewExamModal open={previewOpen} onCancel={() => setPreviewOpen(false)} data={previewData} />
            <RejectExamModal open={rejectOpen} onCancel={() => setRejectOpen(false)} topicId={topicId} />
            <Modal title="Unsaved Changes" open={leaveConfirmOpen} onCancel={() => setLeaveConfirmOpen(false)} footer={[
                <Button key="discard" danger onClick={discardAndLeave}>Leave without Saving</Button>,
                <Button key="save" type="primary" onClick={saveDraftAndLeave}>Save & Leave</Button>,
                <Button key="stay" onClick={() => setLeaveConfirmOpen(false)}>Stay</Button>
            ]}><p>Save your work before leaving?</p></Modal>
            <ModalComponent />
        </>
    );
};

const SectionSelectModal = ({ open, onCancel, onSelect, selectedSkill, initialSelectedIds }) => {
    const { data: sections, isLoading } = useGetSections(selectedSkill);
    const [localSelectedIds, setLocalSelectedIds] = useState(initialSelectedIds);
    useEffect(() => { if (open) setLocalSelectedIds(initialSelectedIds); }, [open, initialSelectedIds]);
    const handleConfirm = () => {
        const selectedObjects = (sections || []).filter((s) => localSelectedIds.includes(s.ID));
        onSelect(selectedObjects);
    };
    return (
        <Modal title={`Select Section`} open={open} onCancel={onCancel} onOk={handleConfirm} width={800}>
            <Spin spinning={isLoading}>
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {sections?.map((section) => (
                        <Card key={section.ID} hoverable style={{ marginBottom: 12, border: localSelectedIds.includes(section.ID) ? "2px solid #1677ff" : "1px solid #f0f0f0", background: localSelectedIds.includes(section.ID) ? "#e6f4ff" : "white" }} onClick={() => setLocalSelectedIds([section.ID])}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div><Text strong>{section.Name}</Text><p style={{ fontSize: "12px", color: "#666" }}>{section.Description}</p></div>
                                <Checkbox checked={localSelectedIds.includes(section.ID)} />
                            </div>
                        </Card>
                    ))}
                </div>
            </Spin>
        </Modal>
    );
};

export default CreateExamPage;
