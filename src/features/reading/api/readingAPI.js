import axiosInstance from '@shared/config/axios'

export const fetchReadingTestDetails = async () => {
  const globalData = JSON.parse(localStorage.getItem('globalData'))

  if (!globalData?.topicId) {
    throw new Error('Topic ID not found in global data')
  }

  const response = await axiosInstance.get(`/topics/${globalData.topicId}`, {
    params: {
      skillName: 'READING'
    }
  })
  return response.data
}