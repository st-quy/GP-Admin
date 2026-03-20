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
import React, { useEffect, useState, useMemo } from "react";
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
    const [selectedParts, setSelectedParts] = useState([]); // chỉ chứa ID section
    const [selectedSectionBySkill, setSelectedSectionBySkill] = useState({}); // chứa ID theo skill
    const [instructions, setInstructions] = useState([]); // chứa full section để hiển thị UI
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const { openConfirmModal, ModalComponent } = useConfirm();
    const [rejectOpen, setRejectOpen] = useState(false);

    // SCRUM-130 States
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

        // ✅ BỎ CHỌN
        if (!sections || sections.length === 0) {
            setSelectedParts((prev) =>
                prev.filter((id) => id !== oldSectionId)
            );

            setSelectedSectionBySkill((prev) => {
                const copy = { ...prev };
                delete copy[selectedSkill];
                return copy;
            });

            setInstructions((prev) =>
                prev.filter((i) => i.skill !== selectedSkill)
            );

            setOpenModal(false);
            return;
        }

        const section = sections[0];
        const sectionId = section.ID;

        setSelectedParts((prev) => {
            const filtered = prev.filter((id) => id !== oldSectionId);
            return [...filtered, sectionId];
        });

        setSelectedSectionBySkill((prev) => ({
            ...prev,
            [selectedSkill]: sectionId,
        }));

        setInstructions((prev) => {
            const filtered = prev.filter((i) => i.skill !== selectedSkill);
            return [...filtered, { skill: selectedSkill, section }];
        });

        setOpenModal(false);
    };

    const handlePreview = () => {
        if (instructions.length === 0) {
            message.warning("Please select at least one skill to preview.");
            return;
        }

        const skillsOrder = ["SPEAKING", "LISTENING", "GRAMMAR AND VOCABULARY", "READING", "WRITING"];
        const skills = skillsOrder.map(skillName => {
            const found = instructions.find(i => i.skill === skillName);
            if (!found) {
                return {
                    ID: skillName,
                    Name: skillName,
                    Parts: [],
                };
            }

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
            if (!values.name || !values.name.trim()) return message.error("Exam name is required and cannot be only whitespace");

            // Logic tự động giới hạn điểm cho từng Section theo chuẩn Aptis (50/20)
            const finalScores = { ...questionScores };
            instructions.forEach(({ skill, section }) => {
                const sectionQuestions = [];
                (section.Parts || []).forEach(p => {
                    (p.Questions || []).forEach(q => sectionQuestions.push(q.ID));
                });

                const total = sectionQuestions.reduce((acc, qid) => acc + (finalScores[qid] || 0), 0);
                
                // Quy tắc Aptis chuẩn: Speaking/Writing tối đa 50đ, các phần còn lại 20đ
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
                    data: {
                        Name: values.name.trim(),
                        Status: 'draft',
                        ShuffleQuestions: shuffleQuestions,
                        ShuffleAnswers: shuffleAnswers
                    }
                });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({
                    topicId: savedTopicId,
                    data: {
                        sectionIds: selectedParts,
                        scoreConfig: finalScores
                    }
                });

            } else {
                topicResponse = await createExam({
                    Name: values.name.trim(),
                    Status: 'draft',
                    ShuffleQuestions: shuffleQuestions,
                    ShuffleAnswers: shuffleAnswers
                });
                const savedTopicId = topicResponse.ID || topicResponse._ID;

                if (!savedTopicId) return message.error("Cannot get topic ID");

                await updateTopicSection({
                    topicId: savedTopicId,
                    data: {
                        sectionIds: selectedParts,
                        scoreConfig: finalScores
                    }
                });
            }

            message.success(topicId ? "Topic updated successfully!" : "Topic created successfully!");
            navigate("/exam");

        } catch (error) {
            console.error(error);
            message.error("Failed to save topic");
        }
    };

    const handleSubmitExam = async () => {
        if (instructions.length < 5) {
            message.warning("Please select skill before save");
            return;
        }
        try {
            const values = form.getFieldsValue();
            if (!values.name || !values.name.trim()) return message.error("Exam name is required and cannot be only whitespace");

            // Logic tự động giới hạn điểm cho từng Section theo chuẩn Aptis (50/20)
            const finalScores = { ...questionScores };
            instructions.forEach(({ skill, section }) => {
                const sectionQuestions = [];
                (section.Parts || []).forEach(p => {
                    (p.Questions || []).forEach(q => sectionQuestions.push(q.ID));
                });

                const total = sectionQuestions.reduce((acc, qid) => acc + (finalScores[qid] || 0), 0);
                
                // Quy tắc Aptis chuẩn: Speaking/Writing tối đa 50đ, các phần còn lại 20đ
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
                    data: {
                        Name: values.name.trim(),
                        Status: 'submited',
                        ShuffleQuestions: shuffleQuestions,
                        ShuffleAnswers: shuffleAnswers
                    }
                });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({
                    topicId: savedTopicId,
                    data: {
                        sectionIds: selectedParts,
                        scoreConfig: finalScores
                    }
                });

            } else {
                topicResponse = await createExam({
                    Name: values.name.trim(),
                    Status: 'submited',
                    ShuffleQuestions: shuffleQuestions,
                    ShuffleAnswers: shuffleAnswers
                });
                const savedTopicId = topicResponse.ID || topicResponse._ID;

                if (!savedTopicId) return message.error("Cannot get topic ID");

                await updateTopicSection({
                    topicId: savedTopicId,
                    data: {
                        sectionIds: selectedParts,
                        scoreConfig: finalScores
                    }
                });
            }

            message.success(topicId ? "Topic updated successfully!" : "Topic created successfully!");
            navigate("/exam");

        } catch (error) {
            console.error(error);
            message.error("Failed to save topic");
        }
    };

    const handleScoreChange = (questionId, score) => {
        setQuestionScores(prev => ({
            ...prev,
            [questionId]: score
        }));
    };

    const renderInstructionContent = () => {
        const found = instructions.find((i) => i.skill === selectedSkill);
        if (!found) {
            return (
                <div style={{ textAlign: "center", padding: "40px 0", background: "#f9f9f9", borderRadius: 8, border: "1px dashed #d9d9d9" }}>
                    <Text type="secondary">No section selected for this skill yet.</Text>
                    <div style={{ marginTop: 16 }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenModal(true)}>
                            Select Section
                        </Button>
                    </div>
                </div>
            );
        }

        const { section } = found;
        const sectionQuestionsCount = (section.Parts || []).reduce((acc, p) => acc + (p.Questions?.length || 0), 0);
        const sectionTotalScore = (section.Parts || []).reduce((acc, p) => {
            return acc + (p.Questions || []).reduce((qAcc, q) => qAcc + (questionScores[q.ID] || 0), 0);
        }, 0);

        return (
            <div style={{ position: 'relative' }}>
                <Card
                    style={{
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        borderRadius: 12,
                        background: "#FAFAFA",
                    }}
                    bodyStyle={{ padding: 16 }}
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                                <Text strong style={{ fontSize: 16 }}>{section.Name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontWeight: 'normal', fontSize: 14 }}>{section.Description}</Text>
                                <div style={{ marginTop: 4 }}>
                                    <Text strong style={{ color: sectionTotalScore > (["SPEAKING", "WRITING"].includes(selectedSkill) ? 50 : 20) ? '#faad14' : '#1677ff' }}>
                                        Total Section Score: {sectionTotalScore.toFixed(2)}
                                        {sectionTotalScore > (["SPEAKING", "WRITING"].includes(selectedSkill) ? 50 : 20) && (
                                            <span style={{ color: '#ff4d4f' }}> 
                                                (Will be capped at {["SPEAKING", "WRITING"].includes(selectedSkill) ? "50.00" : "20.00"})
                                            </span>
                                        )}
                                    </Text>
                                </div>
                            </div>
                            {!isViewMode && (
                                <Button
                                    type="dashed"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenModal(true);
                                    }}
                                >
                                    Change Section
                                </Button>
                            )}
                        </div>
                    }
                >

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
                                    <br />
                                    <Text type="secondary">{part.SubContent}</Text>

                                    <div style={{ marginTop: 8 }}>
                                        {(() => {
                                            let questions = [...(part.Questions || [])];

                                            // Logic Xáo trộn trực quan để giáo viên Preview (SCRUM-130 UX Enhancement)
                                            if (shuffleQuestions) {
                                                questions.sort(() => Math.random() - 0.5);
                                            }

                                            return questions.map((q, index) => (
                                                <div
                                                    key={q.ID}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        justifyContent: "space-between",
                                                        gap: 24,
                                                        marginBottom: 16,
                                                        padding: '8px 0',
                                                        borderBottom: '1px dashed #f0f0f0'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
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

                                                        <div style={{ flex: 1 }}>
                                                            <Text style={{ fontSize: 15, lineHeight: "22px" }}>
                                                                {q.Content}
                                                            </Text>

                                                            {/* Hiển thị Shuffle Answers Preview (SCRUM-130 UX) */}
                                                            {shuffleAnswers && q.Type === 'multiple-choice' && (
                                                                <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px solid #eee' }}>
                                                                    <Tag color="orange" style={{ fontSize: 10 }}>Answers will be shuffled</Tag>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!isViewMode && (
                                                        <div style={{ minWidth: 140, textAlign: 'right' }}>
                                                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textAlign: 'left' }}>Score (pts)</div>
                                                            <InputNumber
                                                                min={0}
                                                                max={50}
                                                                step={0.1}
                                                                value={questionScores[q.ID] || 0}
                                                                onChange={(val) => handleScoreChange(q.ID, val)}
                                                                style={{ width: '100%', textAlign: 'left' }}
                                                                placeholder="0.0"
                                                                controls={false}
                                                            />
                                                        </div>
                                                    )}
                                                    {isViewMode && (
                                                        <div style={{ width: 80, textAlign: 'right' }}>
                                                            <Tag color="blue" style={{ margin: 0, padding: '4px 8px' }}>
                                                                {questionScores[q.ID] || 0} pts
                                                            </Tag>
                                                        </div>
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>

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
        form.setFieldsValue({ name: topicData.Name });

        // Load Shuffle settings
        setShuffleQuestions(!!topicData.ShuffleQuestions);
        setShuffleAnswers(!!topicData.ShuffleAnswers);

        if (topicData.creator) {
            const creatorName = [topicData.creator.firstName, topicData.creator.lastName].filter(Boolean).join(' ');
            form.setFieldsValue({ creator: creatorName });
        }

        if (topicData.updater) {
            const editorName = [topicData.updater.firstName, topicData.updater.lastName].filter(Boolean).join(' ');
            form.setFieldsValue({ editor: editorName });
        }

        const sectionsBySkill = {};
        const instructionsData = [];
        const selectedIds = [];
        const scores = {};

        (topicData.Sections || []).forEach(section => {
            const skill = section.Skill.Name;
            sectionsBySkill[skill] = section.ID;
            selectedIds.push(section.ID);
            instructionsData.push({ skill, section });

            // Load scores if available in TopicSection relation
            if (section.TopicSection?.ScoreConfig) {
                Object.assign(scores, section.TopicSection.ScoreConfig);
            }
        });

        setSelectedSectionBySkill(sectionsBySkill);
        setInstructions(instructionsData);
        setSelectedParts(selectedIds);
        setQuestionScores(scores);
    }, [topicData]);

    const allowedCharactersRegex = /^[a-zA-Z0-9 _-]*$/;

    return (
        <>
            <HeaderInfo
                title={
                    isViewMode
                        ? "View Exam Details"
                        : topicId
                            ? "Edit Exam"
                            : "Create New Exam"
                }
                actions={
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Button icon={<LeftOutlined />} onClick={() => navigate("/exam")}>
                            Back to List
                        </Button>
                        <Button icon={<EyeOutlined />} onClick={handlePreview}>
                            Preview
                        </Button>
                        {!isViewMode && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveExam}
                                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSubmitExam}
                                >
                                    Submit Exam
                                </Button>
                            </>
                        )}
                        {role === "admin" && topicData?.Status === "submited" && (
                            <div style={{ display: "flex", gap: "12px" }}>
                                <Button
                                    type="primary"
                                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                                    onClick={() => openConfirmModal("approve")}
                                >
                                    Approve
                                </Button>
                                <Button danger onClick={() => setRejectOpen(true)}>
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                }
            />

            <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                <Spin spinning={isLoading}>
                    <Form form={form} layout="vertical">
                        <Card
                            title="Basic Information"
                            style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                        >
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Exam Name"
                                        name="name"
                                        rules={[
                                            { required: true, message: "Please enter exam name" },
                                            {
                                                pattern: allowedCharactersRegex,
                                                message: "Only alphanumeric characters, spaces, underscores, and hyphens are allowed."
                                            }
                                        ]}
                                    >
                                        <Input
                                            placeholder="e.g. Aptis Practice Test 2024"
                                            size="large"
                                            disabled={isViewMode}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Creator" name="creator">
                                        <Input size="large" disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Last Updated By" name="editor">
                                        <Input size="large" disabled />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Shuffle Settings UI */}
                            {!isViewMode && (
                                <div style={{ marginTop: 8, padding: '16px', background: '#f0f5ff', borderRadius: 8, border: '1px solid #adc6ff' }}>
                                    <Title level={5} style={{ marginBottom: 16, color: '#003087' }}>
                                        <SwapOutlined /> Exam Randomization Settings
                                    </Title>
                                    <Row gutter={48}>
                                        <Col>
                                            <Space size="middle">
                                                <Switch
                                                    checked={shuffleQuestions}
                                                    onChange={setShuffleQuestions}
                                                    disabled={selectedSkill !== "GRAMMAR AND VOCABULARY"}
                                                />
                                                <Text strong style={{ color: selectedSkill !== "GRAMMAR AND VOCABULARY" ? '#bfbfbf' : 'inherit' }}>
                                                    Shuffle Questions {selectedSkill !== "GRAMMAR AND VOCABULARY" && "(Fixed sequence for this skill)"}
                                                </Text>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space size="middle">
                                                <Switch
                                                    checked={shuffleAnswers}
                                                    onChange={setShuffleAnswers}
                                                    disabled={!["GRAMMAR AND VOCABULARY", "LISTENING", "READING"].includes(selectedSkill)}
                                                />
                                                <Text strong style={{ color: !["GRAMMAR AND VOCABULARY", "LISTENING", "READING"].includes(selectedSkill) ? '#bfbfbf' : 'inherit' }}>
                                                    Shuffle Multiple-Choice Answers
                                                </Text>
                                            </Space>
                                        </Col>
                                    </Row>
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary" italic style={{ fontSize: 12 }}>
                                            * Shuffling will be applied uniquely for each student during the actual test.
                                        </Text>
                                    </div>
                                </div>
                            )}
                            {isViewMode && (
                                <div style={{ marginTop: 8 }}>
                                    <Space size="large">
                                        <Tag color={shuffleQuestions ? "blue" : "default"}>
                                            Shuffle Questions: {shuffleQuestions ? "ON" : "OFF"}
                                        </Tag>
                                        <Tag color={shuffleAnswers ? "blue" : "default"}>
                                            Shuffle Answers: {shuffleAnswers ? "ON" : "OFF"}
                                        </Tag>
                                    </Space>
                                </div>
                            )}
                        </Card>

                        <Card
                            title="Exam Structure & Content"
                            bodyStyle={{ padding: 0 }}
                            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                        >
                            <Tabs
                                activeKey={selectedSkill}
                                onChange={setSelectedSkill}
                                type="line"
                                size="large"
                                centered
                                items={SKILL_TABS.map((tab) => ({
                                    key: tab.key,
                                    label: (
                                        <span style={{ padding: "0 20px" }}>
                                            {tab.icon} {tab.label}
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ padding: "24px" }}>
                                            {renderInstructionContent()}
                                        </div>
                                    ),
                                }))}
                            />
                        </Card>

                        {/* Footer Action Buttons */}
                        {!isViewMode && (
                            <div style={{ marginTop: 24, padding: '16px', background: 'white', borderRadius: 12, display: 'flex', justifyContent: 'flex-end', gap: 12, boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}>
                                <Button 
                                    size="large" 
                                    onClick={() => navigate("/exam")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="large"
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveExam}
                                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    size="large"
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSubmitExam}
                                >
                                    Submit Exam
                                </Button>
                            </div>
                        )}
                    </Form>
                </Spin>
            </Content>

            <SectionSelectModal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onSelect={handlePartSelect}
                selectedSkill={selectedSkill}
                initialSelectedIds={selectedSectionBySkill[selectedSkill] ? [selectedSectionBySkill[selectedSkill]] : []}
            />

            <PreviewExamModal
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                data={previewData}
            />

            <RejectExamModal
                open={rejectOpen}
                onCancel={() => setRejectOpen(false)}
                topicId={topicId}
            />

            <ModalComponent />
        </>
    );
};

const SectionSelectModal = ({ open, onCancel, onSelect, selectedSkill, initialSelectedIds }) => {
    const { data: sections, isLoading } = useGetSections(selectedSkill);
    const [localSelectedIds, setLocalSelectedIds] = useState(initialSelectedIds);

    useEffect(() => {
        if (open) setLocalSelectedIds(initialSelectedIds);
    }, [open, initialSelectedIds]);

    const handleConfirm = () => {
        const selectedObjects = (sections || []).filter((s) => localSelectedIds.includes(s.ID));
        onSelect(selectedObjects);
    };

    return (
        <Modal
            title={`Select Section for ${selectedSkill}`}
            open={open}
            onCancel={onCancel}
            onOk={handleConfirm}
            width={800}
            okText="Confirm Selection"
        >
            <Spin spinning={isLoading}>
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {sections?.map((section) => (
                        <Card
                            key={section.ID}
                            hoverable
                            style={{
                                marginBottom: 12,
                                border: localSelectedIds.includes(section.ID) ? "2px solid #1677ff" : "1px solid #f0f0f0",
                                background: localSelectedIds.includes(section.ID) ? "#e6f4ff" : "white",
                            }}
                            onClick={() => setLocalSelectedIds([section.ID])}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <Text strong>{section.Name}</Text>
                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>
                                        {section.Description}
                                    </p>
                                </div>
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
