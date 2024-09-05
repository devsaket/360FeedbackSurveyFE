import React from 'react'

const SurveyTraitMapping = ({ traitSelfOthersData }) => {

    // Trait of Strength
    const filterTopTraits = () => {
        return traitSelfOthersData.filter(item => {
            const selfRating = parseFloat(item.selfRating);
            const averageOtherRating = parseFloat(item.averageOtherRating);
            return selfRating >= 5 && averageOtherRating >= 5;
        });
    };

    const topTraitsOfStrength = filterTopTraits();

    // Trait of Potential Strength
    const getHighPotential = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating).toFixed(1),
                averageOtherRating: parseFloat(item.averageOtherRating).toFixed(1),
                difference: (parseFloat(item.averageOtherRating) - parseFloat(item.selfRating)).toFixed(1)
            };
        });

        const highPotentialTraits = traitsWithComparison.filter(item => { return item.selfRating > 4 && item.selfRating < 5 && item.averageOtherRating > 4 && item.averageOtherRating < 5 });
        return highPotentialTraits;
    };

    const highPotentialTraits = getHighPotential();

    // Hidden Traits with Developmental Needs
    const getTopTraits = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating),
                averageOtherRating: parseFloat(item.averageOtherRating),
                difference: parseFloat(item.selfRating) - parseFloat(item.averageOtherRating)
            };
        });

        const sortedTraits = traitsWithComparison.sort((a, b) => b.difference - a.difference);
        const filteredTraits = sortedTraits.filter(trait => trait.difference > 0);

        return filteredTraits.slice(0, 5);
    };

    const topTraits = getTopTraits(); 

    // Blind Traits with Developmental Needs
    const getUnknownDeficiency = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating).toFixed(1),
                averageOtherRating: parseFloat(item.averageOtherRating).toFixed(1),
                difference: (parseFloat(item.averageOtherRating) - parseFloat(item.selfRating)).toFixed(1)
            };
        });

        const unknownDeficiencyTraits = traitsWithComparison.filter(item => { return item.difference > 0 });
        return unknownDeficiencyTraits;
    };

    const unknownDeficiencyTraits = getUnknownDeficiency();

    // Trait with High Developmental Needs
    const getOpenDeficiency = () => {
        const openDeficiencyTraits = traitSelfOthersData.filter(item => { return item.selfRating < 4 && item.averageOtherRating < 4 });
        return openDeficiencyTraits;
    };

    const openDeficiencyTraits = getOpenDeficiency();


    return (
        <>
            <h3>Mapping of Traits by Developmental Need</h3>

            <div className='d-flex flex-row'>
                {/* Traits of Strengths */}
                <div className="trapezoid" style={{borderColor:"#5356FF"}}>
                    <div className='text-box'>
                        <h4 className='pt-3 text-white'>Traits of Strengths</h4>
                        {topTraitsOfStrength.length > 0 ? <>
                            <ul>
                                {topTraitsOfStrength.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            <p className='text-white'>No such Traits are Found</p>
                        </>}
                    </div>
                </div>

                {/* Traits of Potential Strengths */}
                <div className="trapezoid" style={{borderColor:"#4857dbe0"}}>
                    <div className='text-box'>
                        <h4 className='pt-3 text-white'>Traits of Potential Strengths</h4>
                        {highPotentialTraits.length > 0 ? <>
                            <ul>
                                {highPotentialTraits.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            <p className='text-white'>No such Traits are Found</p>
                        </>}
                    </div>
                </div>

                {/* Hidden Traits With Development Needs */} 
                <div className="trapezoid" style={{borderColor:"#378CE7"}}>
                    <div className='text-box'>
                        <h4 className='pt-3 text-white'>Hidden Traits With Development Needs</h4>
                        {topTraits.length > 0 ? <>
                            <ul>
                                {topTraits.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            <p className='text-white'>No such Traits are Found</p>
                        </>}
                    </div>
                </div>

                {/* Blind Traits With Development Needs */}
                <div className="trapezoid" style={{borderColor:"#67C6E3"}}>
                    <div className='text-box'>
                        <h4 className='pt-3 text-white'>Blind Traits With Development Needs</h4>
                        {unknownDeficiencyTraits.length > 0 ? <>
                            <ul>
                                {unknownDeficiencyTraits.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            <p className='text-white'>No such Traits are Found</p>
                        </>}
                    </div>
                </div>

                {/* Traits With High Developmental Needs */}
                <div className="trapezoid" style={{borderColor:"#1d458f"}}>
                    <div className='text-box'>
                        <h4 className='pt-3 text-white'>Traits With High Developmental Needs</h4>
                        {openDeficiencyTraits.length > 0 ? <>
                            <ul>
                                {openDeficiencyTraits.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            <p className='text-white'>No such Traits are Found</p>
                        </>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SurveyTraitMapping