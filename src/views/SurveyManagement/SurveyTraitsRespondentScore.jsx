import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SurveyTraitsRespondentScore = ({ traitRespondentsData }) => {
  // console.log("Data SOrted = ", traitRespondentsData)
  const traitOthersRating = traitRespondentsData.sort((a, b) => parseFloat(b.averageOtherRating) - parseFloat(a.averageOtherRating));
  return (
    <>
      <h2>Ranking of Traits Based on the Average of Multi-Raters’ Feedback Scoring</h2>
      {/* {
        traitOthersRating.map((item, index) => {
          return (
            <>
              <div key={index} className='d-flex flex-row justify-content-between'>
                <h3>{item.trait}</h3>
                <p>{item.averageOtherRating}</p>
              </div>
            </>
          )
        })
      } */}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={traitOthersRating} layout="horizontal">
          <YAxis type="number" domain={[0, 7]} tickCount={8} />
          <XAxis type="category" dataKey="trait" />
          <Tooltip />
          <Legend />
          <Bar dataKey="averageOtherRating" fill="#2E236C" />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default SurveyTraitsRespondentScore
