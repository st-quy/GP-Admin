// SectionDetail.jsx
import UpdateGrammarVocab from '@pages/QuestionBank/components/UpdateSkills/UpdateGrammarVocab';
import UpdateListening from '@pages/QuestionBank/components/UpdateSkills/UpdateListening';
import UpdateReading from '@pages/QuestionBank/components/UpdateSkills/UpdateReading';
import UpdateSpeaking from '@pages/QuestionBank/components/UpdateSkills/UpdateSpeaking';
import UpdateWriting from '@pages/QuestionBank/components/UpdateSkills/UpdateWriting';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useLocation, useParams } from 'react-router-dom';
import { SectionApi } from '@features/sections/api';

const SectionUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const skillName = queryParams.get('skillName');
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await SectionApi.getDetail(id, skillName);
        if (data.data?.Status === 'archived') {
          setIsArchived(true);
        }
      } catch (err) {
        console.error('Failed to check section status:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [id, skillName]);

  if (!skillName) return <div>Missing skillName</div>;
  if (!id) return <div>Missing id</div>;

  if (loading) return <div>Loading...</div>;

  if (isArchived) {
    return (
      <div className="figma-page-container">
        <div className="figma-content-wrapper">
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold text-gray-700">This section is archived and cannot be edited.</h2>
            <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const normalized = skillName.trim().toUpperCase();

  const renderDetail = () => {
    switch (normalized) {
      case 'LISTENING':
        return <UpdateListening />;

      case 'READING':
        return <UpdateReading />;

      case 'WRITING':
        return <UpdateWriting />;

      case 'SPEAKING':
        return <UpdateSpeaking />;

      case 'GRAMMAR AND VOCABULARY':
        return <UpdateGrammarVocab />;

      default:
        return <div>❌ Skill "{skillName}" is not supported yet.</div>;
    }
  };

  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <div className="py-8">
          {renderDetail()}
        </div>
      </div>
    </div>
  );
};

export default SectionUpdate;
