// SectionDetail.jsx
import React from 'react';
import SectionListeningDetail from './components/SectionListeningDetail';
import SectionReadingDetail from './components/reading/SectionReadingDetail';
import { useLocation, useParams } from 'react-router-dom';
import SectionSpeakingDetail from './components/speaking/SectionSpeakingDetail';
import SectionWritingDetail from './components/writing/SectionWritingDetail';
import GrammarVocabDetail from './components/grammar/GrammarVocabDetail';

const SectionDetail = () => {
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
        return <SectionListeningDetail id={id} />;

      case 'READING':
        return <SectionReadingDetail id={id} />;

      case 'WRITING':
        return <SectionWritingDetail id={id} />;

      case 'SPEAKING':
        return <SectionSpeakingDetail id={id} />;

      case 'GRAMMAR AND VOCABULARY':
        return <GrammarVocabDetail id={id} />;

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

export default SectionDetail;
