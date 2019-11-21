import StudentPortfolio from './StudentPortfolio.js';

function sleep (n) {
    console.log('sleep...',n);
    return new Promise ((resolve,reject)=>{
        console.log('wake!')
        window.setTimeout(()=>resolve(),n)
    });
}

jest.mock('./DocumentManager.js')
jest.mock('./SheetManager.js')
jest.mock('./SheetBasics.js')

fit('empty portfolio',()=>{
    const sp = StudentPortfolio({id:'empty'},{userId:'test-student',profile:{name:{fullName:'Joe Shmoe'}}},true);
     async function getPortfolio () {
         const portfolio = await sp.get_portfolio_data()
         expect(portfolio.data).toBeDefined();
         console.log('Got portfolio',portfolio);
         expect(portfolio.data.length).toEqual(0)
         return portfolio
     }

    async function getEmptyThenFill () {
        const portfolio = await getPortfolio()
        await sleep(1000);
        await sp.set_portfolio_and_assessments(
            {...portfolio,
             data:[{courseworkId:'aaa',
                    skill:'baking',
                    reflection:'<p>Some reflection</p>',
                   }]}
        );
        console.log('!!!Done setting data');
        const newData = await sp.get_portfolio_data();
        console.log('!!!Got new data',newData);
        expect(newData.data.length).toEqual(1);
        console.log('!!!Put data in successfully!')
    }
    return getEmptyThenFill();
});
