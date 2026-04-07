import { useLocation, useNavigate, useParams } from 'react-router-dom';
import QuestionLayout from './QuestionLayout';
import CreateListening from './CreateSkills/CreateListening';
import CreateGrammarVocab from './CreateSkills/CreateGrammarVocab';
import CreateSpeaking from './CreateSkills/CreateSpeaking';
import CreateWriting from './CreateSkills/CreateWriting';
import CreateReading from './CreateSkills/CreateReading';
import { Spin } from 'antd';

const PAGE_COMPONENT = {
  speaking: {
    title: 'Create Speaking Questions',
    subTitle: 'Design questions for Speaking skill.',
    component: (draftId) => <CreateSpeaking draftId={draftId} />,
  },
  reading: {
    title: 'Create Reading Questions',
    subTitle: 'Design questions for Reading skill.',
    component: () => <CreateReading />,
  },
  grammar: {
    title: 'Create Grammar Vocab Questions',
    subTitle: 'Design questions for Grammar and Vocabulary skill.',
    component: () => <CreateGrammarVocab />,
  },
  writing: {
    title: 'Create Writing Questions',
    subTitle: 'Design questions for Writing skill.',
    component: () => <CreateWriting />,
  },
  listening: {
    title: 'Create Listening Questions',
    subTitle: 'Design questions for Listening skill.',
    component: () => <CreateListening />,
  },
};

const CreateQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { draftId } = useParams();
  const skill = location.pathname.split('/').filter(Boolean).find((seg, i, arr) => arr[i - 1] === 'create');

  const page = PAGE_COMPONENT[skill];

  if (!page)
    return (
      <Spin className='w-full h-[10rem] flex justify-center items-center' />
    );

  return (
    <QuestionLayout title={page.title} subtitle={page.subTitle}>
      {page.component(draftId)}
    </QuestionLayout>
  );
};

export default CreateQuestion;
