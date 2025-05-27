import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from 'react-bootstrap';

const SurveyTraitMappingArabic = ({ traitSelfOthersData, traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

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
                    const responses = question.responses[categoryName] || [];
                    // Filter out 0 responses
                    const nonZeroResponses = responses.filter(response => response !== 0);
                    //Only if there are non-zero responses, calculate and push the average.
                    if(nonZeroResponses.length > 0){
                        const avgScore = calculateAverage(nonZeroResponses);
                        categoryAverages[categoryName].push(avgScore);
                    }
                    // const avgScore = calculateAverage(question.responses[categoryName] || []);
                    // categoryAverages[categoryName].push(avgScore);
                });
            });

            // Calculate overall averages
            const overallAverages = Object.fromEntries(
                Object.entries(categoryAverages).map(([category, scores]) => [category, scores.length > 0 ? calculateAverage(scores) : 0])
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

            const highPotentialTraits = traitsWithComparison.filter(item => { return item.selfRating >= 4 && item.selfRating < 5 && item.averageOtherRating >= 4 && item.averageOtherRating < 5 });
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
            {/* <h3>Mapping of Traits by Developmental Need</h3> */}
            <h3>تصنيف السمات(الجدارات، المهارات، الصفات)  بناءً على الحاجة التطويرية</h3>

            <div className='row g-5 justify-content-center'>
                {/* Traits of Strengths */}
                <div className="col-4 p-3 trapezoid">
                    <Card style={{ backgroundColor: "#5356ff" }} className='h-100 mapping-card'>
                        <CardHeader>
                            {/* <h4 className='pt-3'>Traits of Strengths</h4> */}
                            <h4 className='pt-3'>سمات (جدارات، مهارات، صفات) تمثل نقاط قوة</h4>
                        </CardHeader>
                        <CardBody>
                            {topTraitsOfStrength.length > 0 ? <>
                                <ul>
                                    {topTraitsOfStrength.map((trait, idx) => (
                                        <li key={idx} className='text-white'>
                                            {trait.trait}
                                        </li>
                                    ))}
                                </ul>
                            </> : <>
                                {/* <p className='text-white'>No such Traits are Found</p> */}
                                <p className='text-white'>لا توجد سمات(جدارات، مهارات، صفات)  من هذا النوع</p>
                            </>}
                        </CardBody>
                    </Card>
                </div>

                {/* Traits of Potential Strengths */}
                <div className="col-4 p-3 trapezoid">
                    <Card style={{ backgroundColor: "#4857dbe0" }} className='h-100 mapping-card'>
                        <CardHeader>
                            {/* <h4 className='pt-3'>Traits of Potential Strengths</h4> */}
                            <h4 className='pt-3'>سمات(جدارات، مهارات، صفات)  تتمتع بفرص للنمو والتطور</h4>
                        </CardHeader>
                        <CardBody>
                            {highPotentialTrait.length > 0 ? <>
                                <ul>
                                    {highPotentialTrait.map((trait, idx) => (
                                        <li key={idx} className='text-white'>
                                            {trait.trait}
                                        </li>
                                    ))}
                                </ul>
                            </> : <>
                                {/* <p className='text-white'>No such Traits are Found</p> */}
                                <p className='text-white'>لا توجد سمات(جدارات، مهارات، صفات)  من هذا النوع</p>
                            </>}
                        </CardBody>
                    </Card>
                </div>

                {/* Hidden Traits With Development Needs */}
                <div className="col-4 p-3 trapezoid">
                    <Card style={{ backgroundColor: "#378ce7" }} className='h-100 mapping-card'    >
                        <CardHeader>
                            {/* <h4 className='pt-3'>Hidden Traits With Development Needs</h4> */}
                            <h4 className='pt-3'>سمات(جدارات، مهارات، صفات)  خفية تحتاج إلى تطوير</h4>
                        </CardHeader>
                        <CardBody>
                            {topTraits.length > 0 ? <>
                                <ul>
                                    {topTraits.map((trait, idx) => (
                                        <li key={idx} className='text-white'>
                                            {trait.trait}
                                        </li>
                                    ))}
                                </ul>
                            </> : <>
                                {/* <p className='text-white'>No such Traits are Found</p> */}
                                <p className='text-white'>لا توجد سمات(جدارات، مهارات، صفات)  من هذا النوع</p>
                            </>}
                        </CardBody>
                    </Card>
                </div>

                {/* Blind Traits With Development Needs */}
                <div className="col-4 p-3 trapezoid">
                    <Card style={{ backgroundColor: "#67C6E3" }} className='h-100 mapping-card'>
                        <CardHeader>
                            {/* <h4 className='pt-3'>Blind Traits With Development Needs</h4> */}
                            <h4 className='pt-3'>سمات (جدارات، مهارات، صفات) عمياء تحتاج إلى تطوير </h4>
                        </CardHeader>
                        <CardBody>
                        {unknownDeficiencyTraits.length > 0 ? <>
                            <ul>
                                {unknownDeficiencyTraits.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            {/* <p className='text-white'>No such Traits are Found</p> */}
                            <p className='text-white'>لا توجد سمات(جدارات، مهارات، صفات)  من هذا النوع</p>
                        </>}
                        </CardBody>
                    </Card>
                </div>

                {/* Traits With High Developmental Needs */}
                <div className="col-4 p-3 trapezoid">
                    <Card style={{ backgroundColor: "#1d458f" }} className='h-100 mapping-card'>
                        <CardHeader>
                            {/* <h4 className='pt-3'>Traits With High Developmental Needs</h4> */}
                            <h4 className='pt-3'>سمات (جدارات، مهارات، صفات) تتطلب اهتمامًا تطويريًا كبيرًا</h4>
                        </CardHeader>
                        <CardBody>
                        {openDeficiencyTraits.length > 0 ? <>
                            <ul>
                                {openDeficiencyTraits.map((trait, idx) => (
                                    <li key={idx} className='text-white'>
                                        {trait.trait}
                                    </li>
                                ))}
                            </ul>
                        </> : <>
                            {/* <p className='text-white'>No such Traits are Found</p> */}
                            <p className='text-white'>لا توجد سمات(جدارات، مهارات، صفات)  من هذا النوع</p>
                        </>}
                        </CardBody>
                    </Card>
                </div>
                
            </div>
        </>
    )
}

export default SurveyTraitMappingArabic