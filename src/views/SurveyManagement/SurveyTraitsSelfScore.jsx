import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SurveyTraitsSelfScore = ({ traitSelfData }) => {
  const traitSelfRating = traitSelfData.sort((a, b) => parseFloat(b.selfRating) - parseFloat(a.selfRating));
  return (
    <>
      <h2>Rank Traits based on average of Self rating</h2>
        {
          traitSelfRating.map((item,index)=>{
            return(
              <>
                <div key={index}>
                  <h3 className=''>{item.trait}</h3>
                  {/* <p>{item.averageOtherRating}</p> */}
                </div>
              </>
            )
          })
        }

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={traitSelfData} layout="horizontal">
          <YAxis type="number" />
          <XAxis type="category" dataKey="trait" />
          <Tooltip />
          <Legend />
          <Bar dataKey="selfRating" fill="#ff6700" />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default SurveyTraitsSelfScore
