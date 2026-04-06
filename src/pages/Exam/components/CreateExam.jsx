// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    AudioOutlined,
    ReadOutlined,
    EditOutlined,
    BookOutlined,
    CustomerServiceOutlined,
    HolderOutlined,
    LeftOutlined,
    EyeOutlined,
    SoundOutlined,
    FormOutlined,
    InfoCircleOutlined,
    ArrowRightOutlined,
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
    Row,
    Col,
    ConfigProvider,
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
    { key: "LISTENING", label: "Listening", icon: <SoundOutlined /> },
    { key: "GRAMMAR AND VOCABULARY", label: "Grammar & Vocabulary", icon: <BookOutlined /> },
    { key: "READING", label: "Reading", icon: <ReadOutlined /> },
    { key: "WRITING", label: "Writing", icon: <FormOutlined /> },
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
    
    useEffect(() => {
        setOpenModal(false);
    }, [location.key]);

    const isAdmin = Array.isArray(role) 
      ? role.some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'superadmin')
      : (typeof role === 'string' && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin'));

    const handleApprove = async () => {
        openConfirmModal({
            title: 'Approve Exam',
            message: `Are you sure you want to approve this exam? This will make the exam available for students.`,
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
            const values = await form.validateFields(['name', 'duration']);
            let topicResponse;
            const topicPayload = { 
                Name: values.name.trim(), 
                Status: 'draft',
                Duration: values.duration
            };

            if (topicId) {
                topicResponse = await updateTopic({ id: topicId, data: topicPayload });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({ topicId: savedTopicId, data: { sectionIds: selectedParts } });
            } else {
                topicResponse = await createExam(topicPayload);
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
            const topicPayload = { 
                Name: values.name.trim(), 
                Status: 'submited',
                Duration: values.duration
            };

            let topicResponse;
            if (topicId) {
                topicResponse = await updateTopic({ id: topicId, data: topicPayload });
                const savedTopicId = topicResponse.ID || topicResponse._ID || topicId;
                await updateTopicSection({ topicId: savedTopicId, data: { sectionIds: selectedParts } });
            } else {
                topicResponse = await createExam(topicPayload);
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

        const data = topicData?.data ? topicData.data : topicData;

        const previewExamData = {
            ID: topicId,
            Name: form.getFieldValue("name"),
            Skills: skills,
            createdAt: data?.createdAt || new Date().toISOString(),
            updatedAt: data?.updatedAt || new Date().toISOString(),
        };
        setPreviewData(previewExamData);
        setPreviewOpen(true);
    };

    const onNameChange = (e) => {
        let value = e.target.value;
        
        if (/[^a-zA-Z0-9\s]/.test(value)) {
            message.warning('Special characters and emojis are not allowed in exam name.');
            value = value.replace(/[^a-zA-Z0-9\s]/g, '');
        }

        if (/\s{2,}/.test(value)) {
            message.info('Multiple spaces are not allowed; collapsed to a single space.');
            value = value.replace(/\s{2,}/g, ' ');
        }

        if (value.length > 50) {
            message.error('Exam name limit reached (max 50 characters).');
            value = value.slice(0, 50);
        }

        value = value.replace(/^\s+/, '');
        form.setFieldsValue({ name: value });
        setIsDirty(true);
    };

    const onDurationChange = (e) => {
        let value = e.target.value;
        
        if (/[^0-9]/.test(value)) {
            message.warning('Only numbers are allowed for duration.');
            value = value.replace(/[^0-9]/g, '');
        }

        if (value.length > 4) {
            message.error('Max duration limit reached (9999 minutes).');
            value = value.slice(0, 4);
        }

        form.setFieldsValue({ duration: value });
        setIsDirty(true);
    };

    const renderSelectedSectionUI = () => {
        const data = instructions.find(ins => ins.skill === selectedSkill);
        if (!data) {
            return (
                <div className="w-full h-[158px] border-[1px] border-dashed border-[#D1D5DB] rounded-lg flex flex-col items-center justify-center text-[#9CA3AF] cursor-pointer hover:bg-gray-50 transition-all gap-2"
                     onClick={() => { if (!isViewMode) setOpenModal(true) }}>
                    <span className="text-[27px] font-normal leading-[33px]">+</span>
                    <span className="text-[21px] font-normal leading-[25px]">Instruction</span>
                </div>
            );
        }
        const { section } = data;
        return (
            <div className="w-full">
                <Card 
                    className="border-[1px] border-[#E5E7EB] rounded-lg bg-[#FAFAFA]" 
                    bodyStyle={{ padding: 20 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <Text className="text-[18px] font-semibold text-[#111827]">{section.Name}</Text>
                        {!isViewMode && (
                            <Button 
                                type="link" 
                                danger 
                                onClick={(e) => { e.stopPropagation(); handlePartSelect([]); }}
                                className="font-medium"
                            >
                                Remove Section
                            </Button>
                        )}
                    </div>
                    <Text className="text-gray-500 mb-6 block">{section.Description}</Text>
                    
                    <div className="mt-6 space-y-4">
                        {(section.Parts || []).map((part) => (
                            <div key={part.ID} className="p-4 border-[1px] border-[#E5E7EB] rounded-lg bg-white shadow-sm">
                                <Text className="font-bold text-[#111827] block mb-2">{part.Content}</Text>
                                {!(selectedSkill === "READING" || selectedSkill === "WRITING") && (
                                    <Text className="text-gray-400 text-sm block mb-4">{part.SubContent}</Text>
                                )}
                                
                                {!(selectedSkill === "READING" || selectedSkill === "WRITING") && (
                                    <div className="mt-2">
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
                                                            <div className="flex items-start gap-4 mb-3 p-3 rounded-lg bg-[#F9FAFB] border-[1px] border-transparent hover:border-[#E5E7EB] transition-all">
                                                                {!isViewMode && <HolderOutlined {...listeners} {...attributes} className="cursor-grab text-gray-400 mt-1" />}
                                                                <div className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                                                                    {(selectedSkill === "SPEAKING" && part.Content === "Part 4") ? "+" : (index + 1)}
                                                                </div>
                                                                <Text className="text-[15px] leading-[22px] text-[#374151]">{q.Content}</Text>
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
        const data = topicData.data ? topicData.data : topicData;
        if (!data || !data.Name) return;

        form.setFieldsValue({ 
            name: data.Name,
            duration: data.Duration,
            creator: data.creator ? `${data.creator.firstName} ${data.creator.lastName}` : "Unknown",
            editor: data.updater ? `${data.updater.firstName} ${data.updater.lastName}` : "None"
        });
        
        const sectionsBySkill = {};
        const instructionsData = [];
        const selectedIds = [];
        (data.Sections || []).forEach(section => {
            const skill = section.Skill?.Name;
            if (!skill) return;
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
        <div className="figma-page-container">
            <div className="figma-content-wrapper">
                <ConfigProvider
                    theme={{
                        token: {
                            controlHeight: 50,
                            borderRadius: 8,
                        }
                    }}
                >
                    <div className="py-8">
                        <div className="mb-10">
                            <h4 className="figma-title">
                                {isViewMode ? "View Exam Details" : topicId ? "Edit Exam" : "Create New Exam"}
                            </h4>
                            <p className="figma-subtitle">
                                {isViewMode 
                                    ? "Preview the exam information and structure." 
                                    : topicId 
                                        ? "Modify exam information, structure, and skill-based questions." 
                                        : "Set up exam details, structure, and choose skill-based questions."
                                }
                            </p>
                        </div>

                        <Form form={form} layout="vertical">
                            <Card 
                                className="mb-8 border-[1px] border-[#E5E7EB] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                                bodyStyle={{ padding: 25 }}
                            >
                                <div className="flex items-center gap-2 mb-8">
                                    <InfoCircleOutlined style={{ color: '#003087', fontSize: '18px' }} />
                                    <span className="text-[18px] font-semibold text-[#111827]">Exam Basic Information</span>
                                </div>

                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item 
                                            label={<span className="text-[14px] font-medium text-[#374151]">Exam Name *</span>} 
                                            name="name" 
                                            rules={[{ required: true, message: 'Please enter exam name' }]}
                                        >
                                            <Input 
                                                maxLength={51} 
                                                placeholder="e.g., IELTS Academic Practice Test 1" 
                                                disabled={isViewMode}
                                                onChange={onNameChange}
                                                className="!h-[50px] border-[#D1D5DB]"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item 
                                            label={<span className="text-[14px] font-medium text-[#374151]">Duration (minutes) *</span>} 
                                            name="duration" 
                                            rules={[{ required: true, message: 'Please enter duration' }]}
                                        >
                                            <Input 
                                                type="text"
                                                placeholder="e.g. 60" 
                                                disabled={isViewMode} 
                                                onChange={onDurationChange}
                                                className="w-full !h-[50px] border-[#D1D5DB]"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label={<span className="text-[14px] font-medium text-[#374151]">Creator</span>} name="creator">
                                            <Input disabled className="!h-[50px] border-[#D1D5DB]" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label={<span className="text-[14px] font-medium text-[#374151]">Last Edited By</span>} name="editor">
                                            <Input disabled className="!h-[50px] border-[#D1D5DB]" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            <Card 
                                className="border-[1px] border-[#E5E7EB] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden"
                                bodyStyle={{ padding: 0 }}
                            >
                                <div className="flex border-b-[1px] border-[#E5E7EB] bg-[#F8FAFC]">
                                    {SKILL_TABS.map((tab) => {
                                        const active = selectedSkill === tab.key;
                                        return (
                                            <div 
                                                key={tab.key} 
                                                onClick={() => setSelectedSkill(tab.key)} 
                                                className={`
                                                    flex items-center gap-3 px-6 h-[52px] cursor-pointer transition-all font-medium text-[14px]
                                                    ${active ? "bg-[#003087] text-white" : "text-[#64748B] hover:bg-gray-100"}
                                                `}
                                            >
                                                {React.cloneElement(tab.icon, { style: { color: active ? "white" : "#64748B", fontSize: '16px' } })}
                                                {tab.label}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-8">
                                    {renderSelectedSectionUI()}
                                </div>
                            </Card>

                            <div className="flex justify-between items-center mt-10 pb-10">
                                <Button 
                                    icon={<EyeOutlined />} 
                                    onClick={handlePreviewExam}
                                    className="!h-[50px] !px-8 !rounded-lg font-medium border-[#D1D5DB] text-[#374151]"
                                >
                                    Start Exam Preview
                                </Button>
                                
                                <Space size="middle">
                                    <Button 
                                        onClick={() => handleNavigateAway('/exam')}
                                        className="!h-[50px] !w-[120px] !rounded-lg font-medium border-[#D1D5DB] text-[#374151]"
                                    >
                                        Cancel
                                    </Button>
                                    
                                    {isViewMode && isAdmin && (topicData?.data?.Status === 'submited' || topicData?.Status === 'submited') && (
                                        <>
                                            <Button 
                                                type="primary" 
                                                style={{ background: "#22AD5C", borderColor: "#22AD5C" }} 
                                                onClick={handleApprove}
                                                className="!h-[50px] !w-[140px] !rounded-lg font-medium shadow-none hover:opacity-90"
                                            >
                                                Approve
                                            </Button>
                                            <Button 
                                                danger 
                                                type="primary" 
                                                onClick={handleReject}
                                                className="!h-[50px] !w-[140px] !rounded-lg font-medium shadow-none hover:opacity-90"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}

                                    {!isViewMode && (
                                        <>
                                            <Button 
                                                onClick={handleSaveExam}
                                                className="!h-[50px] !px-6 !rounded-lg font-medium border-[#003087] text-[#003087]"
                                            >
                                                Save As Draft
                                            </Button>
                                            <Button 
                                                type="primary" 
                                                onClick={handleSubmitExam}
                                                icon={<ArrowRightOutlined />}
                                                className="!h-[50px] !px-6 !rounded-lg font-medium !bg-[#003087] !border-none shadow-none hover:opacity-90"
                                            >
                                                Submit For Review
                                            </Button>
                                        </>
                                    )}
                                </Space>
                            </div>
                        </Form>
                    </div>
                </ConfigProvider>

                <ChooseSectionModal open={openModal} onCancel={() => setOpenModal(false)} skillName={selectedSkill} onSelect={handlePartSelect} selectedSectionId={selectedSectionBySkill[selectedSkill]} />
                <PreviewExam isModalOpen={previewOpen} setIsModalOpen={setPreviewOpen} dataExam={previewData} fileData={null} setDataExam={setPreviewData} />
                <ModalComponent />
                <Modal 
                    title={<span className="text-[18px] font-semibold text-[#111827]">You have unsaved changes</span>} 
                    open={leaveConfirmOpen} 
                    onCancel={() => setLeaveConfirmOpen(false)} 
                    centered
                    footer={[
                        <div className="flex justify-end gap-3 p-4 pt-0" key="footer">
                            <Button 
                                key="discard" 
                                danger 
                                onClick={discardAndLeave}
                                className="!h-[50px] !px-6 !rounded-lg font-medium border-[#FF4D4F] text-[#FF4D4F]"
                            >
                                Leave without Saving
                            </Button>
                            <Button 
                                key="save" 
                                type="primary" 
                                onClick={saveDraftAndLeave}
                                className="!h-[50px] !px-6 !rounded-lg font-medium !bg-[#003087] !border-none shadow-none hover:opacity-90"
                            >
                                Save as Draft & Leave
                            </Button>
                        </div>
                    ]}
                >
                    <p className="text-[#4B5563] text-[15px] leading-[22px]">
                        You have unsaved changes in your exam structure. Would you like to save your work as a draft before leaving this page?
                    </p>
                </Modal>
            </div>
        </div>
    );
};

export default CreateExamPage;
