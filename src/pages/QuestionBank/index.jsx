import { ExportOutlined } from '@ant-design/icons'
import { Button, Select, Typography } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const skillOptions = [
    { value: 'create-speaking', label: 'Speaking' },
    { value: 'create-listening', label: 'Listening' },
    { value: 'create-reading', label: 'Reading' },
    { value: 'create-writing', label: 'Writing' },
    { value: 'create-grammar-vocab', label: 'Grammar & Vocab' }
]

const QuestionBank = () => {
    const navigate = useNavigate()

    const handleRedirect = (value) => {
        // Redirect sang page tương ứng
        navigate(`/question-bank/${value}`)
    }

    return (
        <div>
            <div className='mt-4 flex justify-between items-center  '>
                <div className='left-area'>
                    <Title level={3}>Question List</Title>
                    <Text>Question List</Text>
                </div>

                <div className='right-area flex gap-2'>
                    <Button className=' min-h-[3rem] min-w-[5rem] bg-green-500 text-white font-bold'>
                        <ExportOutlined />
                        Add questions from Exel</Button>
                    <Select
                        defaultValue="Create Question"
                        style={{ width: 160, height: 45 }}
                        options={skillOptions}
                        onChange={handleRedirect}
                    />
                </div>
            </div>
        </div>
    )
}

export default QuestionBank