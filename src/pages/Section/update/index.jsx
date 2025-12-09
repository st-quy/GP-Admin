// SectionDetail.jsx
import UpdateGrammarVocab from '@pages/QuestionBank/components/UpdateSkills/UpdateGrammarVocab';
import UpdateListening from '@pages/QuestionBank/components/UpdateSkills/UpdateListening';
import UpdateReading from '@pages/QuestionBank/components/UpdateSkills/UpdateReading';
import UpdateSpeaking from '@pages/QuestionBank/components/UpdateSkills/UpdateSpeaking';
import UpdateWriting from '@pages/QuestionBank/components/UpdateSkills/UpdateWriting';
import React from 'react';

import { useLocation, useParams } from 'react-router-dom';

const SectionUpdate = () => {
  const { id } = useParams();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const skillName = queryParams.get('skillName');

  if (!skillName) return <div>Missing skillName</div>;
  if (!id) return <div>Missing id</div>;

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

  return <div className='p-4'>{renderDetail()}</div>;
};

export default SectionUpdate;
