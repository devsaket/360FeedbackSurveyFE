import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ProgressBar from './Charts/ProgressBar';

const SurveyTraitsSelfScore = ({ traitSelfData }) => {
  const traitSelfRating = traitSelfData.sort((a, b) => parseFloat(b.selfRating) - parseFloat(a.selfRating));
  return (
    <>
      <h2>Ranking of Traits Based on Self Rating</h2>
        {
          traitSelfRating.map((item,index)=>{
            return(
              <>
                <div key={index} className='d-flex flex-row justify-content-between'>
                  <h3 className=''>{item.trait}</h3>
                  {/* <p>{item.selfRating}</p> */}
                  <div className='w-25'>
                    <ProgressBar bgcolor="#6a1b9a" completed={item.selfRating} max={7}  /> 
                  </div>
                </div>
              </>
            )
          })
        }

      {/* <ResponsiveContainer width="100%" height={400}>
        <BarChart data={traitSelfData} layout="horizontal">
          <YAxis type="number" domain={[0, 7]} tickCount={8} />
          <XAxis type="category" dataKey="trait" />
          <Tooltip />
          <Legend />
          <Bar dataKey="selfRating" fill="#ff6700" />
        </BarChart>
      </ResponsiveContainer> */}
    </>
  )
}

export default SurveyTraitsSelfScore
