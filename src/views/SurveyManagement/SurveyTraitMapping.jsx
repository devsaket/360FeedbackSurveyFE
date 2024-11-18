import React, { useEffect, useState } from 'react'

const SurveyTraitMapping = ({ traitSelfOthersData, traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

    const [highPotentialTrait, setHighPotentialTrait] = useState([]);
    const [topTraitsOfStrength, setTopTraitsOfStrength] = useState([]);
    const [topTraits, setTopTraits] = useState([]);
    const [unknownDeficiencyTraits, setUnknownDeficiencyTraits] = useState([]);
    const [openDeficiencyTraits, setOpenDeficiencyTraits] = useState([]);

    // Map over surveyCategory and add categoryName
    const updatedSurveyCategory = surveyCategoryObject.map((survey, index) => {
        const matchedCategory = categoriesRolesObject.find(category => category._id === survey.category);
        return {
            ...survey,
            categoryName: matchedCategory ? matchedCategory.categoryName : null,
        };
    });

    // Add 'Self' to updatedSurveyCategory
    const categoriesWithSelf = [{ categoryName: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];

    useEffect(() => {
        const calculateAverage = (arr) => arr.reduce((sum, val) => sum + val, 0) / (arr.length || 1);

        // Step 1: Transform traitQuestionData
        const transformedData = Object.keys(traitQuestionData).map(trait => {
            const questions = traitQuestionData[trait];

            // Step 1: Transform traitQuestionData dynamically based on categoriesWithSelf
            // Initialize categoryAverages dynamically
            const categoryAverages = Object.fromEntries(categoriesWithSelf.map(cat => [cat.categoryName, []]));

            Object.values(questions).forEach(question => {
                categoriesWithSelf.forEach(({ categoryName }) => {
                    const avgScore = calculateAverage(question.responses[categoryName] || []);
                    categoryAverages[categoryName].push(avgScore);
                });
            });

            // Calculate overall averages
            const overallAverages = Object.fromEntries(
                Object.entries(categoryAverages).map(([category, scores]) => [category, calculateAverage(scores)])
            );

            return { trait, ...overallAverages };
        });

        // Step 4: Calculate weighted average for categories except Self
        const finalData = transformedData.map(data => {
            const totalWeightedScore = surveyCategoryObject.reduce((acc, role) => {
                const avgScore = data[categoriesRolesObject.find(cat => cat._id === role.category)?.categoryName];
                const weight = role.scoreWeightage || 0;
                return acc + (avgScore * (weight / 100));
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
            const averageOfOthers = totalWeightedScore.toFixed(1);

            return { ...data, averageOfOthers: parseFloat(averageOfOthers) };
        });

        // High Potential // Trait of Potential Strength
        const getHighPotential = () => {
            const traitsWithComparison = finalData.map(item => {
                return {
                    trait: item.trait,
                    selfRating: parseFloat(item.Self).toFixed(1),
                    averageOtherRating: parseFloat(item.averageOfOthers).toFixed(1),
                    difference: (parseFloat(item.Self) - parseFloat(item.averageOfOthers)).toFixed(1)
                };
            });

            const highPotentialTraits = traitsWithComparison.filter(item => { return item.selfRating > 4 && item.selfRating < 5 && item.averageOtherRating > 4 && item.averageOtherRating < 5 });
            return highPotentialTraits;
        };

        const highPotentialTraits = getHighPotential();
        setHighPotentialTrait(highPotentialTraits);
        // console.log("Final Data = ", highPotentialTraits);

        // Trait of Strength
        const filterTopTraits = () => {
            return finalData.filter(item => {
                const selfRating = parseFloat(item.Self);
                const averageOtherRating = parseFloat(item.averageOfOthers);
                return selfRating >= 5 && averageOtherRating >= 5;
            });
        };

        const topTraitsOfStrength = filterTopTraits();
        setTopTraitsOfStrength(topTraitsOfStrength);
        

        // Hidden Traits with Developmental Needs
        const getTopTraits = () => {
            const traitsWithComparison = finalData.map(item => {
                return {
                    trait: item.trait,
                    selfRating: parseFloat(item.Self),
                    averageOtherRating: parseFloat(item.averageOfOthers),
                    difference: parseFloat(item.Self) - parseFloat(item.averageOfOthers)
                };
            });

            const sortedTraits = traitsWithComparison.sort((a, b) => b.difference - a.difference);
            const filteredTraits = sortedTraits.filter(trait => trait.difference > 0);
            return filteredTraits.slice(0, 5);
        };

        const topTraits = getTopTraits();
        setTopTraits(topTraits);

        // Blind Traits with Developmental Needs
        const getUnknownDeficiency = () => {
            const traitsWithComparison = finalData.map(item => {
                return {
                    trait: item.trait,
                    selfRating: parseFloat(item.Self).toFixed(1),
                    averageOtherRating: parseFloat(item.averageOfOthers).toFixed(1),
                    difference: (parseFloat(item.averageOfOthers) - parseFloat(item.Self)).toFixed(1)
                };
            });

            const unknownDeficiencyTraits = traitsWithComparison.filter(item => { return item.difference > 0 });
            return unknownDeficiencyTraits;
        };

        const unknownDeficiencyTraits = getUnknownDeficiency();
        setUnknownDeficiencyTraits(unknownDeficiencyTraits)

        // Trait with High Developmental Needs
        const getOpenDeficiency = () => {
            const openDeficiencyTraits = finalData.filter(item => { return item.Self < 4 && item.averageOfOthers < 4 });
            return openDeficiencyTraits;
        };

        const openDeficiencyTraits = getOpenDeficiency();
        setOpenDeficiencyTraits(openDeficiencyTraits);

    }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);




    return (
        <>
            <h3>Mapping of Traits by Developmental Need</h3>

            <div className='d-flex flex-lg-row flex-lg-nowrap flex-md-column flex-md-wrap'>
                {/* Traits of Strengths */}
                <div className="trapezoid" style={{ backgroundColor: "#5356FF" }}>
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
                <div className="trapezoid" style={{ backgroundColor: "#4857dbe0" }}>
                    <div className='text-box'>
                        <h4 className='pt-3 text-white'>Traits of Potential Strengths</h4>
                        {highPotentialTrait.length > 0 ? <>
                            <ul>
                                {highPotentialTrait.map((trait, idx) => (
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
                <div className="trapezoid" style={{ backgroundColor: "#378CE7" }}>
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
                <div className="trapezoid" style={{ backgroundColor: "#67C6E3" }}>
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
                <div className="trapezoid" style={{ backgroundColor: "#1d458f" }}>
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