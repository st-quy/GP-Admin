// @ts-nocheck
import React, { useEffect, useState } from "react";
import HeaderInfo from '@app/components/HeaderInfo';
import {
    AudioOutlined,
    ReadOutlined,
    EditOutlined,
    BookOutlined,
    CustomerServiceOutlined,
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
    Switch,
    InputNumber,
    Row,
    Col
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCreateTopic, useCreateTopicSection, useGetTopicWithRelations, useUpdateTopic, useUpdateTopicSection } from "@features/topic/hooks";
import ChooseSectionModal from "@features/topic/ui/ChooseSectionModal";
import PreviewExam from "@shared/ui/PreviewExam";
import { useSelector } from "react-redux";
import useConfirm from "@shared/hook/useConfirm";
import RejectExamModal from "@features/topic/ui/RejectModal";

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


    const { mutateAsync: createExam } = useCreateTopic();
    const { mutateAsync: createTopicSection } = useCreateTopicSection();
    const { data: topicData, isLoading } = useGetTopicWithRelations(topicId);
    const { mutateAsync: updateTopic } = useUpdateTopic();
    const { mutateAsync: updateTopicSection } = useUpdateTopicSection();
    const { role } = useSelector((state) => state.auth);

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
    const handlePreviewExam = () => {
  if (!instructions.length) {
    message.warning("Please select at least one skill before preview");
    return;
  }

  const skillOrder = [
    "LISTENING",
    "GRAMMAR AND VOCABULARY",
    "READING",
    "WRITING",
    "SPEAKING",
  ];

  const skills = skillOrder.map(skillName => {
    const found = instructions.find(i => i.skill === skillName);

    if (!found || !found.section) {
      return {
        ID: null,
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
            if (!values.name) return message.error("Name is required");

            // Logic tự động giới hạn 50 điểm cho từng Section (Score Config)
            const finalScores = { ...questionScores };
            instructions.forEach(({ section }) => {
                const sectionQuestions = [];
                (section.Parts || []).forEach(p => {
                    (p.Questions || []).forEach(q => sectionQuestions.push(q.ID));
                });

                const total = sectionQuestions.reduce((acc, qid) => acc + (finalScores[qid] || 0), 0);
                
                if (total > 50) {
                    const ratio = 50 / total;
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
                        Name: values.name,
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
                    Name: values.name,
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
            if (!values.name) return message.error("Name is required");

            // Logic tự động giới hạn 50 điểm cho từng Section (Score Config)
            const finalScores = { ...questionScores };
            instructions.forEach(({ section }) => {
                const sectionQuestions = [];
                (section.Parts || []).forEach(p => {
                    (p.Questions || []).forEach(q => sectionQuestions.push(q.ID));
                });

                const total = sectionQuestions.reduce((acc, qid) => acc + (finalScores[qid] || 0), 0);
                
                if (total > 50) {
                    const ratio = 50 / total;
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
                        Name: values.name,
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
                    Name: values.name,
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

    const handleApproveExam = async () => {
        openConfirmModal({
            title: 'Are you sure you want to approve this exam?',
            message: 'Once approved, the exam will be finalized and eligible to be added to a test sessions.',
            okText: "Approve",
            okButtonColor: "#00a405 ",
            onConfirm: async () => {
                try {
                    if (!topicId) return message.error("Topic ID is missing");
                    await updateTopic({ id: topicId, data: { Status: 'approved' } });
                    message.success("Exam approved successfully!");
                    navigate("/exam");
                } catch (error) {
                    console.error(error);
                    message.error("Failed to approve exam");
                }
            },
        });
    }

    const handleRejectExam = async (reason) => {
        try {
            if (!topicId) return message.error("Topic ID is missing");

            await updateTopic({
                id: topicId,
                data: { Status: 'rejected', ReasonReject: reason }
            });

            message.success("Exam rejected successfully!");
            setRejectOpen(false);
            navigate("/exam");
        } catch (error) {
            console.error(error);
            message.error("Failed to reject exam");
        }
    }

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
                        cursor: "pointer"
                    }}
                    onClick={() => { if (!isViewMode) setOpenModal(true) }} // Chỉ mở modal khi vùng này trống
                >
                    + Instruction
                </div>
            );
        }
        const { section } = data;

        // Tính tổng điểm của Section hiện tại
        const sectionTotalScore = (section.Parts || []).reduce((acc, part) => {
            const partScore = (part.Questions || []).reduce((pAcc, q) => {
                return pAcc + (questionScores[q.ID] || 0);
            }, 0);
            return acc + partScore;
        }, 0);

        return (
            <div style={{ width: "100%" }}>
                <Card
                    style={{
                        border: "1px solid #E5E7EB",
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
                                    <Text strong style={{ color: sectionTotalScore > 50 ? '#faad14' : '#1677ff' }}>
                                        Total Section Score: {sectionTotalScore.toFixed(2)} 
                                        {sectionTotalScore > 50 && <span style={{ color: '#ff4d4f' }}> (Will be capped at 50.00)</span>}
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
                                                // Sử dụng thuật toán xáo trộn mảng đơn giản
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
                                                            {shuffleAnswers && q.AnswerContent?.options && (
                                                                <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #1677ff' }}>
                                                                    {(() => {
                                                                        let options = [...q.AnswerContent.options];
                                                                        options.sort(() => Math.random() - 0.5); // Xáo trộn đáp án để preview
                                                                        return options.map((opt, i) => (
                                                                            <div key={i} style={{ fontSize: 13, color: '#595959', marginBottom: 2 }}>
                                                                                <Text type="secondary" strong>{String.fromCharCode(65 + i)}. </Text>
                                                                                {opt.value}
                                                                            </div>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: 8,
                                                            flexShrink: 0,
                                                            background: '#f9f9f9',
                                                            padding: '4px 12px',
                                                            borderRadius: 6
                                                        }}
                                                        onClick={(e) => e.stopPropagation()} 
                                                    >
                                                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Score:</Text>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            value={questionScores[q.ID] || 0}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                setQuestionScores(prev => ({
                                                                    ...prev,
                                                                    [q.ID]: isNaN(val) ? 0 : val
                                                                }));
                                                            }}
                                                            disabled={isViewMode}
                                                            style={{ 
                                                                width: 70, 
                                                                height: 32, 
                                                                padding: '4px 8px',
                                                                border: '1px solid #d9d9d9',
                                                                borderRadius: 4,
                                                                color: 'black',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    </div>
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
        if (!topicData) return;
        form.setFieldsValue({ name: topicData.Name });
        
        // Load Shuffle settings
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
                subtitle={
                    isViewMode
                        ? "Preview the exam information and structure. Editing is disabled."
                        : topicId
                            ? "Modify exam information, structure, and skill-based questions."
                            : "Set up exam details, structure, and choose skill-based questions."
                }
            />

            <Form form={form} layout="vertical" >
                <div style={{ padding: 24 }}>

                    <Card style={{ marginBottom: 24 }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16
                        }}>
                            <Title level={4} style={{ margin: 0 }}>Exam Information</Title>

                            {isViewMode && role == "admin" && topicData?.Status === "submited" && (
                                <Space>
                                    <Button type="primary" style={{ background: "#00a405" }} onClick={() => handleApproveExam()}>
                                        Approve
                                    </Button>
                                    <Button danger type="primary" style={{ background: "#9b1212" }} onClick={() => setRejectOpen(true)}>
                                        Reject
                                    </Button>
                                </Space>
                            )}
                        </div>
                        <Form.Item
                            label="Exam Name"
                            name="name"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="Enter exam name" disabled={isViewMode} />
                        </Form.Item>

                        <Row gutter={48}>
                            <Col>
                                <Form.Item 
                                    label={
                                        <span>
                                            Shuffle Questions
                                            {selectedSkill === "LISTENING" && <Text type="secondary" style={{ marginLeft: 8, fontWeight: 'normal', fontSize: 12 }}>(Disabled for Listening)</Text>}
                                        </span>
                                    } 
                                    labelCol={{ span: 24 }}
                                >
                                    <Switch
                                        checked={selectedSkill === "LISTENING" ? false : shuffleQuestions}
                                        onChange={(checked) => setShuffleQuestions(checked)}
                                        disabled={isViewMode || selectedSkill === "LISTENING"}
                                    />
                                </Form.Item>
                            </Col>
                            <Col>
                                <Form.Item 
                                    label={
                                        <span>
                                            Shuffle Answers
                                            {(selectedSkill === "WRITING" || selectedSkill === "SPEAKING") && <Text type="secondary" style={{ marginLeft: 8, fontWeight: 'normal', fontSize: 12 }}>(Not applicable)</Text>}
                                        </span>
                                    } 
                                    labelCol={{ span: 24 }}
                                >
                                    <Switch
                                        checked={(selectedSkill === "WRITING" || selectedSkill === "SPEAKING") ? false : shuffleAnswers}
                                        onChange={(checked) => setShuffleAnswers(checked)}
                                        disabled={isViewMode || selectedSkill === "WRITING" || selectedSkill === "SPEAKING"}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
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
                            }}
                        >
                            {renderSelectedSectionUI()}
                        </div>
                    </div>
                    <Divider />

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                        <Button type="primary" onClick={handlePreviewExam}>
                            Start Exam Preview
                        </Button>
                        <Space>
                            <Button onClick={() => navigate('/exam')}>Cancel</Button>
                            {!isViewMode && (
                                <>
                                    <Button type="primary" onClick={handleSaveExam}>Save As Draft</Button>
                                    <Button type="primary" onClick={handleSubmitExam}>Submit For Review</Button>
                                </>
                            )}

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
                <PreviewExam
                    isModalOpen={previewOpen}
                    setIsModalOpen={setPreviewOpen}
                    dataExam={previewData}
                    fileData={null}
                    setDataExam={setPreviewData}
                />
                <ModalComponent />
                <RejectExamModal
                    open={rejectOpen}
                    onClose={() => setRejectOpen(false)}
                    onSubmit={handleRejectExam}
                />

            </Form>
        </>
    );
};

export default CreateExamPage;
