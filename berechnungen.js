
(()=>{
  'use strict';
  const getElement = id => document.getElementById(id);
  
  const testToolToggle = document.getElementById('testToolToggle');
const testTools = document.getElementById('testTools');

testToolToggle.addEventListener('click', () => {
  const isVisible = testTools.style.display !== 'block';

  testTools.style.display = isVisible ? 'block' : 'none';

  testToolToggle.setAttribute(
    'aria-expanded',
    String(isVisible)
  );
});
  
  
  
  
  
  
  const formatFrancs=n=>new Intl.NumberFormat('de-CH',{
    maximumFractionDigits:0
  }).format(Math.round(n));
  const limitToRange=(v,incomePartner1,incomePartner2)=>Math.max(incomePartner1,Math.min(incomePartner2,v));
 let initiativeVariant='worst';
  // Abzüge und Steuertarife
function calculateJobDeduction(income){
    return Math.max(-income,Math.min(-2000,Math.max(-4000,-0.03*income)))
  } 


function calculateCurrentMarriedTariff(e) {
  e = Math.max(0, e);

  if (e <= 29700) return 0;
  if (e <= 53400) return (e - 29700) * 0.01;
  if (e <= 61300) return 237 + (e - 53400) * 0.02;
  if (e <= 79100) return 395 + (e - 61300) * 0.03;
  if (e <= 94900) return 929 + (e - 79100) * 0.04;
  if (e <= 108700) return 1561 + (e - 94900) * 0.05;
  if (e <= 120600) return 2251 + (e - 108700) * 0.06;
  if (e <= 130500) return 2965 + (e - 120600) * 0.07;
  if (e <= 138400) return 3658 + (e - 130500) * 0.08;
  if (e <= 144300) return 4290 + (e - 138400) * 0.09;
  if (e <= 148300) return 4821 + (e - 144300) * 0.10;
  if (e <= 150400) return 5221 + (e - 148300) * 0.11;
  if (e <= 152400) return 5452 + (e - 150400) * 0.12;
  if (e <= 941300) return 5692 + (e - 152400) * 0.13;
  if (e <= 941400) return 108249 + (e - 941300) * 0.12;

  return 108261 + (e - 941400) * 0.115;
}

 
  

function calculateNewIndividualTariff(e) {
  e = Math.max(0, e);

  if (e <= 20000) return 0;
  if (e <= 34300) return (e - 20000) * 0.007;
  if (e <= 44800) return 100.10 + (e - 34300) * 0.009;
  if (e <= 59800) return 194.60 + (e - 44800) * 0.02;
  if (e <= 78600) return 494.60 + (e - 59800) * 0.033;
  if (e <= 84600) return 1115.00 + (e - 78600) * 0.07;
  if (e <= 112300) return 1535.00 + (e - 84600) * 0.08;
  if (e <= 145900) return 3751.00 + (e - 112300) * 0.095;
  if (e <= 190900) return 6943.00 + (e - 145900) * 0.117;
  if (e <= 732400) return 12208.00 + (e - 190900) * 0.133;

  return 84226.00 + (e - 732400) * 0.115;
}


  // Alter gewöhnlicher Tarif (geltendes Recht)

function calculateCurrentSingleTariff(e) {
  e = Math.max(0, e);

  if (e <= 15200) return 0;
  if (e <= 33200) return (e - 15200) * 0.0077;
  if (e <= 43500) return 138.60 + (e - 33200) * 0.0088;
  if (e <= 58000) return 229.20 + (e - 43500) * 0.0264;
  if (e <= 76200) return 612.00 + (e - 58000) * 0.0297;
  if (e <= 82100) return 1152.50 + (e - 76200) * 0.0594;
  if (e <= 108900) return 1502.95 + (e - 82100) * 0.066;
  if (e <= 141500) return 3271.75 + (e - 108900) * 0.088;
  if (e <= 185100) return 6140.55 + (e - 141500) * 0.11;
  if (e <= 793900) return 10936.55 + (e - 185100) * 0.132;
  if (e <= 794000) return 91298.15 + (e - 793900) * 0.1185;

  return 91310.00 + (e - 794000) * 0.115;
}


  // Zentrale Berechnung aller Vergleichswerte
function calculateTaxes(
  incomePartner1,
  incomePartner2,
  numberOfChildren,
  retiredPartner1,
  retiredPartner2
){



const jobDeductionPartner1 = retiredPartner1
  ? 0
  : calculateJobDeduction(incomePartner1);

const jobDeductionPartner2 = retiredPartner2
  ? 0
  : calculateJobDeduction(incomePartner2);

const combinedJobDeductions =
  jobDeductionPartner1 + jobDeductionPartner2;

const insuranceDeduction = -3700;
const childDeduction = -numberOfChildren * 6800;
const childInsuranceDeduction = -numberOfChildren * 700;
   
    const bothAreWorking =
  !retiredPartner1 &&
  !retiredPartner2 &&
  incomePartner1 > 0 &&
  incomePartner2 > 0;

let twoEarnerDeduction = 0;

if (bothAreWorking) {
  const lowerIncome = Math.min(incomePartner1, incomePartner2);

  const lowerIncomeJobDeduction =
    calculateJobDeduction(lowerIncome);

  const lowerIncomeAfterJobDeduction =
    lowerIncome + lowerIncomeJobDeduction;

  twoEarnerDeduction = -Math.min(
    lowerIncomeAfterJobDeduction,
    Math.max(
      8600,
      Math.min(lowerIncomeAfterJobDeduction / 2, 14100)
    )
  );
}
	
	
	
	const lowerIncome = Math.min(incomePartner1, incomePartner2);

	const lowerJobDeduction = bothAreWorking
	  ? calculateJobDeduction(lowerIncome)
	  : 0;

	const lowerIncomeAfterCosts = Math.max(
	  0,
	  lowerIncome + lowerJobDeduction
	);

	// Fairnessinitiative, niedrige Belastung:
	// grosszügigerer Zweiverdienerabzug
	const fairTwoEarnerDeduction = bothAreWorking
	  ? -Math.max(
		  8600,
		  Math.min(lowerIncomeAfterCosts / 2, 14100)
		)
	  : 0;

	// Fairnessinitiative, niedrige Belastung:
	// Einverdienerabzug bei nur einem Erwerbstätigen
	const exactlyOneWorking =
	  (!retiredPartner1 && incomePartner1 > 0) !==
	  (!retiredPartner2 && incomePartner2 > 0);

	const fairOneEarnerDeduction = exactlyOneWorking
	  ? -8600
	  : 0;

	
	
	
	
	
	
	
	
	
    const combinedIncome=incomePartner1+incomePartner2;
    const taxableIncomeToday=Math.max(0,combinedIncome+combinedJobDeductions+insuranceDeduction+childDeduction+childInsuranceDeduction+twoEarnerDeduction-2800);
    const taxToday=Math.max(0,calculateCurrentMarriedTariff(taxableIncomeToday)-numberOfChildren*263);
    const taxableIncomeWithoutMarriageDeductions=Math.max(0,combinedIncome+combinedJobDeductions+insuranceDeduction+childDeduction+childInsuranceDeduction);
    const taxWithoutMarriageDeductions=Math.max(0,calculateCurrentMarriedTariff(taxableIncomeWithoutMarriageDeductions)-numberOfChildren*263);
    
	
	const taxableIncomeFairWithDeductions = Math.max(
	  0,
	  combinedIncome
		+ combinedJobDeductions
		+ insuranceDeduction
		+ childDeduction
		+ childInsuranceDeduction
		+ fairTwoEarnerDeduction
		+ fairOneEarnerDeduction
		- 2800
	);

	const taxFairWithDeductions = Math.max(
	  0,
	  calculateCurrentMarriedTariff(taxableIncomeFairWithDeductions)
		- numberOfChildren * 263
	);

	
	
	
	
	
	
	
	
	
	const childrenPerPartner=numberOfChildren/2;

    // Fairnessinitiative: separate Alternativberechnung vor 2032.
    // Kinderabzüge werden je zur Hälfte auf beide Partner verteilt.
    function fairnessTaxableIncome(income,job,extraDeduction=0){
      return Math.max(0,income+job-1800-childrenPerPartner*6800-childrenPerPartner*700-extraDeduction);
    }

    const partner1IsEarner =
  !retiredPartner1 && incomePartner1 > 0;

const partner2IsEarner =
  !retiredPartner2 && incomePartner2 > 0;

const exactlyOneEarner =
  partner1IsEarner !== partner2IsEarner;

const oneEarnerDeductionPartner1 = 0;
const oneEarnerDeductionPartner2 = 0;






    const taxableAlternativePartner1=fairnessTaxableIncome(incomePartner1,jobDeductionPartner1,oneEarnerDeductionPartner1);
    const taxableAlternativePartner2=fairnessTaxableIncome(incomePartner2,jobDeductionPartner2,oneEarnerDeductionPartner2);

    // Modus «Beide Abzüge bleiben»: höheres Einkommen mit altem
    // Verheiratetentarif, tieferes Einkommen mit altem gewöhnlichem Tarif.
    
	const partner1IsHigher = incomePartner1 >= incomePartner2;
	const hasChildren = numberOfChildren > 0;
	
	const childCreditPartner1 = partner1IsHigher ? numberOfChildren * 263 : 0;
	const childCreditPartner2 = partner1IsHigher ? 0 : numberOfChildren * 263;

	

	const fairnessAlternativeWithDeductions =
	  Math.max(0, (
		hasChildren && partner1IsHigher
		  ? calculateCurrentMarriedTariff(taxableAlternativePartner1)
		  : calculateCurrentSingleTariff(taxableAlternativePartner1)
	  ) - childCreditPartner1) +
	  Math.max(0, (
		hasChildren && !partner1IsHigher
		  ? calculateCurrentMarriedTariff(taxableAlternativePartner2)
		  : calculateCurrentSingleTariff(taxableAlternativePartner2)
	  ) - childCreditPartner2);



    // Modus «Beide Abzüge entfallen»: beide Partner mit dem alten
    // gewöhnlichen Tarif.

	
	
    

const fairnessAlternativeWithoutDeductions =
  Math.max(
    0,
    calculateCurrentSingleTariff(taxableAlternativePartner1)
      - childrenPerPartner * 263
  ) +
  Math.max(
    0,
    calculateCurrentSingleTariff(taxableAlternativePartner2)
      - childrenPerPartner * 263
  );




	
	
	
    
	
const initiativeTaxWithDeductions = Math.min(
  taxFairWithDeductions,
  fairnessAlternativeWithDeductions
);

const initiativeTaxWithoutDeductions = Math.min(
  taxWithoutMarriageDeductions,
  fairnessAlternativeWithoutDeductions
);


	
	
	
	

    /* Individualbesteuerung gemäss Excel-Tabelle:
   je Person CHF 1'800 Versicherungsabzug, Kinderabzug CHF 12'000
   und Kinder-Versicherungsabzug CHF 700, je hälftig verteilt;
   Steuerabzug pro Kind CHF 259, ebenfalls hälftig. */
    function individualNew(income,job){
      const taxable=Math.max(0,income+job-1800-childrenPerPartner*12000-childrenPerPartner*700);
      return Math.max(0,calculateNewIndividualTariff(taxable)-childrenPerPartner*259);
    } const individualTax=individualNew(incomePartner1,jobDeductionPartner1)+individualNew(incomePartner2,jobDeductionPartner2);
    return{
  taxToday,
  taxWithoutMarriageDeductions,
  initiativeTaxWithDeductions,
  initiativeTaxWithoutDeductions,
  individualTax,
      debug:{
	  
		fairTwoEarnerDeduction,
		fairOneEarnerDeduction,
		taxableIncomeFairWithDeductions,
		taxBeforeChildCreditFairWithDeductions:
		  calculateCurrentMarriedTariff(taxableIncomeFairWithDeductions),
	  
	  
	  
	  
        jobDeductionPartner1,jobDeductionPartner2,insuranceDeduction,childDeduction,
		
		
        childInsuranceDeduction,twoEarnerDeduction,taxableIncomeToday,
        taxBeforeChildCreditToday:calculateCurrentMarriedTariff(taxableIncomeToday),
        taxableIncomeWithoutMarriageDeductions,
        taxBeforeChildCreditWithoutMarriageDeductions:calculateCurrentMarriedTariff(taxableIncomeWithoutMarriageDeductions),
        childCreditToday:numberOfChildren*263,childrenPerPartner,
        oneEarnerDeductionPartner1,oneEarnerDeductionPartner2,
        taxableAlternativePartner1,taxableAlternativePartner2,
		
		
		alternativePartner1Tariff:
		  hasChildren && partner1IsHigher
			? 'Verheirateten-Tarif'
			: 'Gewöhnlicher Tarif',

		alternativePartner2Tariff:
		  hasChildren && !partner1IsHigher
			? 'Verheirateten-Tarif'
			: 'Gewöhnlicher Tarif',

		alternativePartner1TaxBeforeChildCredit:
		  hasChildren && partner1IsHigher
			? calculateCurrentMarriedTariff(taxableAlternativePartner1)
			: calculateCurrentSingleTariff(taxableAlternativePartner1),

		alternativePartner2TaxBeforeChildCredit:
		  hasChildren && !partner1IsHigher
			? calculateCurrentMarriedTariff(taxableAlternativePartner2)
			: calculateCurrentSingleTariff(taxableAlternativePartner2),

		
		
		
		
        
        

childCreditAlternative1:
  childCreditPartner1,
childCreditAlternative2:
  childCreditPartner2,

		
		
		
        fairnessAlternativeWithDeductions,fairnessAlternativeWithoutDeductions
      }
    }
  } // Darstellung der Steuerdifferenzen im Frontend
function displayTaxDifference(element,difference){
    element.className='change '+(difference<-.5?'less':difference>.5?'more':'same');
    element.textContent=Math.abs(difference)<=.5?'gleich viel':`CHF ${formatFrancs(Math.abs(difference))} ${difference<0?'weniger':'mehr'}`
  }

  const testFrancs=n=>`CHF ${formatFrancs(n)}`;
  const testDeduction=n=>n===0?'–':`− ${testFrancs(Math.abs(n))}`;
  function renderTestTool(a,b,k,r,initiativeTax){
    const d=r.debug;
    const fairTax=initiativeVariant==='best'
      ? d.fairnessAlternativeWithDeductions
      : d.fairnessAlternativeWithoutDeductions;
		
	const fairCommonTax = initiativeVariant === 'best'
	  ? Math.max(0, d.taxBeforeChildCreditFairWithDeductions - k * 263)
	  : r.taxWithoutMarriageDeductions;

	const fairCommonTaxable = initiativeVariant === 'best'
	  ? d.taxableIncomeFairWithDeductions
	  : d.taxableIncomeWithoutMarriageDeductions;

	const fairCommonBeforeCredit = initiativeVariant === 'best'
	  ? d.taxBeforeChildCreditFairWithDeductions
	  : d.taxBeforeChildCreditWithoutMarriageDeductions;


    const set=(id,v)=>getElement(id).innerHTML=v;
    const val=n=>testFrancs(n);
    const ded=n=>testDeduction(n);

    set('testJob1',ded(d.jobDeductionPartner1)); set('testJob2',ded(d.jobDeductionPartner2));
    set('testInsurance',ded(d.insuranceDeduction)); set('testChildDeduction',ded(d.childDeduction));
    set('testChildInsurance',ded(d.childInsuranceDeduction)); set('testTwoEarner',ded(d.twoEarnerDeduction));
    set('testMarriageDeduction',ded(-2800));

    set('testJob1Fair',ded(d.jobDeductionPartner1)); set('testJob2Fair',ded(d.jobDeductionPartner2));
    set('testInsuranceFair',ded(d.insuranceDeduction)); set('testChildDeductionFair',ded(d.childDeduction));
    set('testChildInsuranceFair',ded(d.childInsuranceDeduction));
    set('testTwoEarnerFair',initiativeVariant==='best'?ded(d.fairTwoEarnerDeduction):'–');
    set('testMarriageDeductionFair',initiativeVariant==='best'?ded(-2800):'–');
	set('testOneEarnerFair',
		initiativeVariant==='best'?ded(d.fairOneEarnerDeduction):'–');

    set('testAltJob1',ded(d.jobDeductionPartner1)); set('testAltJob2',ded(d.jobDeductionPartner2));
    set('testAltInsurance',ded(-1800)); set('testAltChildDeduction',ded(-d.childrenPerPartner*6800));
    set('testAltChildInsurance',ded(-d.childrenPerPartner*700));

    const one=d.oneEarnerDeductionPartner1+d.oneEarnerDeductionPartner2;
    set('testOneEarner',one?ded(-one):'–');

    set('testTaxableToday',val(d.taxableIncomeToday));
    set('testTaxableFair',val(fairCommonTaxable));
    set('testTaxableAlt',`${val(d.taxableAlternativePartner1)}<br>${val(d.taxableAlternativePartner2)}`);

set('testTariffToday','Verheirateten-Tarif');
set('testTariffFair','Verheirateten-Tarif');

const partner1IsHigher = a >= b;

let alternativeTariff1;
let alternativeTariff2;
let alternativeTaxBeforeCredit1;
let alternativeTaxBeforeCredit2;


if (initiativeVariant === 'best') {

  const hasChildren = k > 0;

  alternativeTariff1 =
    hasChildren && partner1IsHigher
      ? 'Verheirateten-Tarif'
      : 'Gewöhnlicher Tarif';

  alternativeTariff2 =
    hasChildren && !partner1IsHigher
      ? 'Verheirateten-Tarif'
      : 'Gewöhnlicher Tarif';

  alternativeTaxBeforeCredit1 =
    hasChildren && partner1IsHigher
      ? calculateCurrentMarriedTariff(d.taxableAlternativePartner1)
      : calculateCurrentSingleTariff(d.taxableAlternativePartner1);

  alternativeTaxBeforeCredit2 =
    hasChildren && !partner1IsHigher
      ? calculateCurrentMarriedTariff(d.taxableAlternativePartner2)
      : calculateCurrentSingleTariff(d.taxableAlternativePartner2);

}




 

else {

  // Zugunsten der Staatskasse:
  // beide Partner gewöhnlicher Tarif.

  alternativeTariff1 = 'Gewöhnlicher Tarif';
  alternativeTariff2 = 'Gewöhnlicher Tarif';

  alternativeTaxBeforeCredit1 =
    calculateCurrentSingleTariff(d.taxableAlternativePartner1);

  alternativeTaxBeforeCredit2 =
    calculateCurrentSingleTariff(d.taxableAlternativePartner2);
}

set(
  'testTariffAlt',
  `P1: ${alternativeTariff1}<br>P2: ${alternativeTariff2}`
);

set(
  'testTaxBeforeCredit',
  val(d.taxBeforeChildCreditToday)
);

set(
  'testTaxBeforeCreditFair',
  val(fairCommonBeforeCredit)
);

set(
  'testAltTaxBeforeCredit',
  `P1: ${val(alternativeTaxBeforeCredit1)}<br>
   P2: ${val(alternativeTaxBeforeCredit2)}`
);

    set('testChildCredit',ded(-d.childCreditToday));
    set('testChildCreditFair',ded(-d.childCreditToday));
   
   
	const altChildCredit1 = initiativeVariant === 'best'
	  ? d.childCreditAlternative1
	  : k / 2 * 263;

	const altChildCredit2 = initiativeVariant === 'best'
	  ? d.childCreditAlternative2
	  : k / 2 * 263;

	set(
	  'testAltChildCredit',
	  `P1: ${ded(-altChildCredit1)}<br>P2: ${ded(-altChildCredit2)}`
	);

   
   
   
   
   

    set('testCurrentTax',val(r.taxToday)); set('testFairTax',val(fairCommonTax)); set('testAlternativeTax',val(fairTax));

   
    set('testComparisonSeparate',val(fairTax));
    set('testChosen',`${val(initiativeTax)}`);
    set('testBaseTax',val(r.taxToday)); set('testInitiativeTax',val(initiativeTax));

    const diff=initiativeTax-r.taxToday;
    set('testDifference',Math.abs(diff)<=.5?'gleich viel':`${val(Math.abs(diff))} ${diff<0?'weniger':'mehr'}`);
  }


function renderIndividualTestTool(
  income1,
  income2,
  numberOfChildren,
  r,
  retiredPartner1,
  retiredPartner2
){


    const childrenPerPartner=numberOfChildren/2;
    const job1 = retiredPartner1
  ? 0
  : calculateJobDeduction(income1);

const job2 = retiredPartner2
  ? 0
  : calculateJobDeduction(income2);
	
	
	
	
    const insurance=-1800;
    const child=-childrenPerPartner*12000;
    const childInsurance=-childrenPerPartner*700;

    const taxable1=Math.max(0,income1+job1+insurance+child+childInsurance);
    const taxable2=Math.max(0,income2+job2+insurance+child+childInsurance);

    const taxBefore1=Math.max(0,calculateNewIndividualTariff(taxable1));
    const taxBefore2=Math.max(0,calculateNewIndividualTariff(taxable2));
    const childCredit=childrenPerPartner*259;
    const tax1=Math.max(0,taxBefore1-childCredit);
    const tax2=Math.max(0,taxBefore2-childCredit);
    const individualTax=tax1+tax2;

    const set=(id,v)=>getElement(id).innerHTML=v;
    const val=n=>testFrancs(n);
    const ded=n=>testDeduction(n);

    set('indJob1',ded(job1)); set('indJob2',ded(job2)); set('indJobTotal',ded(job1+job2));
    set('indInsurance1',ded(insurance)); set('indInsurance2',ded(insurance)); set('indInsuranceTotal',ded(insurance*2));
    set('indChild1',ded(child)); set('indChild2',ded(child)); set('indChildTotal',ded(child*2));
    set('indChildInsurance1',ded(childInsurance)); set('indChildInsurance2',ded(childInsurance)); set('indChildInsuranceTotal',ded(childInsurance*2));

    set('indTaxable1',val(taxable1)); set('indTaxable2',val(taxable2)); set('indTaxableTotal',val(taxable1+taxable2));
    set('indTaxBeforeCredit1',val(taxBefore1)); set('indTaxBeforeCredit2',val(taxBefore2)); set('indTaxBeforeCreditTotal',val(taxBefore1+taxBefore2));
    set('indChildCredit1',ded(-childCredit)); set('indChildCredit2',ded(-childCredit)); set('indChildCreditTotal',ded(-(childCredit*2)));
    set('indTax1',val(tax1)); set('indTax2',val(tax2)); set('indTaxTotal',val(individualTax));

    set('indTodayTax',val(r.taxToday));
    set('indIndividualTax',val(individualTax));
    const diff=individualTax-r.taxToday;
    set('indDifference',Math.abs(diff)<=.5?'gleich viel':`${val(Math.abs(diff))} ${diff<0?'weniger':'mehr'}`);
  }

function render(){
    const a = Math.max(
  0,
  +getElement('income1').value || 0
);

const b = Math.max(
  0,
  +getElement('income2').value || 0
);

const numberOfChildren = limitToRange(
  +getElement('kids').value || 0,
  0,
  10
);

const retiredPartner1 =
  getElement('retired1').checked;

const retiredPartner2 =
  getElement('retired2').checked;

const r = calculateTaxes(
  a,
  b,
  numberOfChildren,
  retiredPartner1,
  retiredPartner2
);
	
	
	
	
    getElement('income1Text').textContent=`CHF ${formatFrancs(a)}`;
    getElement('income2Text').textContent=`CHF ${formatFrancs(b)}`;
    getElement('kidsValue').textContent=String(numberOfChildren);
    getElement('todayTax').textContent=`CHF ${formatFrancs(r.taxToday)}`;
	
	// Eingabewerte in beiden Testtabellen anzeigen
	const testInputsText =
	  `Person 1: CHF ${formatFrancs(a)} · ` +
	  `Person 2: CHF ${formatFrancs(b)} · ` +
	  `Kinder: ${numberOfChildren}`;

getElement('testInputsFair').textContent = testInputsText;
getElement('testInputsIndividual').textContent = testInputsText;
	
	
	
	
    const initiativeTax=initiativeVariant==='best'?r.initiativeTaxWithDeductions:r.initiativeTaxWithoutDeductions;
    const individualTax=r.individualTax;
    displayTaxDifference(getElement('initiativeChange'),initiativeTax-r.taxToday);
    getElement('initiativeDetail')//.textContent='gegenüber der heutigen direkten Bundessteuer';
    displayTaxDifference(getElement('individualChange'),individualTax-r.taxToday);
    getElement('individualDetail')//.textContent='gegenüber der heutigen direkten Bundessteuer';
	
    //getElement('variantExplain').textContent=initiativeVariant==='best'?'Verheirateten- und Zweiverdienerabzug bleiben bestehen':'Verheirateten- und Zweiverdienerabzug entfallen';//
	
    getElement('bestBtn').classList.toggle('active',initiativeVariant==='best');
    getElement('worstBtn').classList.toggle('active',initiativeVariant==='worst');

    const policyToggle=getElement('bestBtn').parentElement;
    const isWorst=initiativeVariant==='worst';

    policyToggle.classList.toggle('is-worst',isWorst);
	
	policyToggle.classList.toggle('hint-worst', isWorst);
policyToggle.classList.toggle('hint-best', !isWorst);
 
    renderTestTool(a,b,numberOfChildren,r,initiativeTax);
    renderIndividualTestTool(
  a,
  b,

numberOfChildren,
r,
retiredPartner1,
retiredPartner2
);
  }

  // Eingabefelder
  ['income1', 'income2', 'kids'].forEach(id => {
    getElement(id).addEventListener('input', render);
  });

  // Pensioniert-Checkboxen
  ['retired1', 'retired2'].forEach(id => {
    getElement(id).addEventListener('change', render);
  });

  // Kinder
  getElement('kids').addEventListener('change', render);


  // Spielraum-Schalter
  const policyToggle = getElement('bestBtn').parentElement;

  let draggingPolicy = false;

  function setPolicyFromPosition(clientX) {
    const rect = policyToggle.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;

    initiativeVariant = position < 0.5 ? 'worst' : 'best';
    render();
  }

  // Schalter greifen / anklicken
  policyToggle.addEventListener('pointerdown', event => {
    draggingPolicy = true;
    policyToggle.setPointerCapture(event.pointerId);

    setPolicyFromPosition(event.clientX);
  });

  // Schalter ziehen
  policyToggle.addEventListener('pointermove', event => {
    if (!draggingPolicy) return;

    setPolicyFromPosition(event.clientX);
  });

  // Schalter loslassen
  policyToggle.addEventListener('pointerup', () => {
    draggingPolicy = false;
  });

  policyToggle.addEventListener('pointercancel', () => {
    draggingPolicy = false;
  });


  // Erste Berechnung beim Laden
  render();


})();
