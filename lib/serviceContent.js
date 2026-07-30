// Prototype: service-specific content blocks for the Phase 3 content upgrade.
// Currently implements blocks for 'emergency' and 'water-heater-repair'.
// Expand this module to additional services after prototype approval.

function emergencyBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const winterTip = d.winterRisk === 'high'
    ? `Given ${cityName}'s high freeze risk, pay special attention to outdoor hose bibs and pipes in unheated crawl spaces or garages.`
    : d.winterRisk === 'med'
    ? `Although winters are milder, ${cityName} still sees sudden cold snaps that can stress ${d.pipeMaterial} systems.`
    : `${cityName} rarely freezes, but summer heat (${d.summerRiskNote}) still stresses plumbing year-round.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs of a Plumbing Emergency in ${cityName}`,
      body: `In ${cityName}, the most frequently diagnosed plumbing issue is ${d.dominantFailure}. These warning signs mean you should call for emergency help rather than wait:`,
      list: [
        `Water is spreading and cannot be contained with towels or buckets`,
        `Sewage is backing up into sinks, tubs, or floor drains`,
        `A pipe has visibly burst or is spraying water`,
        `There is no water anywhere in the home and no utility outage is reported`,
        `You smell gas near a water heater, stove, or fireplace`,
        `Your water heater is leaking onto flooring or into walls`,
        `Multiple drains back up at the same time`,
        `Water stains on ceilings or walls are spreading quickly`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call an Emergency Plumber in ${cityName}`,
      body: `Call right away when the situation is actively damaging your home, threatens safety, or cannot be stopped at a fixture shutoff. In ${cityName}, this is especially urgent when ${d.dominantFailure} is involved:`,
      list: [
        `Water is running and you cannot locate or turn the main shutoff`,
        `A fixture shutoff valve is seized and the leak continues`,
        `Sewage enters living areas or the yard is saturated with waste water`,
        `You have no hot water during freezing weather`,
        `You smell gas or suspect a gas line leak`,
        `A water heater tank is leaking or the TPR valve is discharging continuously`,
        `Multiple fixtures back up when you flush or run water`,
        `You hear water running when all taps are off`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Safety Steps Before the Plumber Arrives in ${cityName}`,
      body: `While you wait for a licensed plumber, the first priority is limiting damage and keeping everyone safe. These steps apply to ${cityName} ${statePhrase} homes:`,
      list: [
        `Shut the main water valve, usually near the street or where the line enters the home`,
        `If you smell gas, leave the building and call from outside — do not operate switches`,
        `Turn off electricity to flooded areas at the breaker panel only if it is safe to reach`,
        `Open faucets to drain remaining water from the lines and relieve pressure`,
        `Move valuables, rugs, and electronics away from standing water`,
        `Avoid using sinks, tubs, or toilets if a backup is suspected`,
        `Locate your water meter so the plumber can verify the shutoff is complete`,
        `Take photos of the damage for insurance documentation`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `What Not to Do Yourself in a ${cityName} Plumbing Emergency`,
      body: `Some repairs look simple but create bigger risks in older ${cityName} homes with ${d.pipeMaterial}. Do not attempt:`,
      list: [
        `Opening a main sewer cleanout or drain line while water is under pressure`,
        `Repairing or capping a gas line yourself`,
        `Wrapping or patching a pressurized pipe and calling it done`,
        `Working on the gas control valve, pilot light, or electrical connections of a water heater`,
        `Using open flames, heat guns, or chemicals to thaw a frozen pipe`,
        `Delaying the call while water approaches electrical outlets or appliances`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During an Emergency Plumbing Visit in ${cityName}`,
      body: `A licensed emergency plumber in ${cityName} follows a structured process designed to stop damage first and then resolve the cause:`,
      list: [
        `Arrive and verify the home is safe before beginning work`,
        `Locate and stop the water source, including the main or fixture shutoff`,
        `Diagnose the root cause using appropriate inspection tools`,
        `Explain the findings and provide a written upfront quote`,
        `Perform the approved repair with city-appropriate materials and methods`,
        `Test the system and clean the work area before leaving`,
        `Document the repair and provide any warranty or care instructions`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for an Emergency Repair in ${cityName}`,
      body: `Emergency response in ${cityName} is designed to move quickly, though exact timing depends on the problem and time of day:`,
      ordered: true,
      list: [
        `Live operator answers your call 24/7 and dispatches a plumber`,
        `Plumber is routed to your ${cityName} address with a target under 60 minutes`,
        `On-site diagnosis typically takes 15 to 45 minutes`,
        `Written quote is provided before any repair work begins`,
        `Repair time ranges from 30 minutes for simple shutoffs to several hours for larger failures`,
        `Final testing, cleanup, and documentation complete the visit`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of an Emergency Plumber in ${cityName}`,
      body: `The final cost of an emergency plumbing visit in ${cityName} depends on several factors, not just the time of the call:`,
      list: [
        `Severity and type of failure — a shutoff replacement is simpler than a burst wall pipe`,
        `Pipe material and era in your home, such as ${d.pipeMaterial} from the ${d.pipeEra}`,
        `Access difficulty — leaks behind walls, under slabs, or in crawl spaces take longer`,
        `Extent of water damage and whether extraction or drying is needed`,
        `Parts required and whether they must be sourced after hours`,
        `Permit or utility coordination if the repair involves the main service line`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Plumbing Emergencies in ${cityName}`,
      body: `Most emergency calls in ${cityName} can be reduced with routine awareness. Local water from ${d.waterUtility} is ${d.hardnessPpm} mg/L, and ${d.dominantFailure} is the most common issue. ${winterTip}`,
      list: [
        `Test the main shutoff valve once a year so it turns freely in a crisis`,
        `Know the location of your water meter and how to shut water off at the street`,
        `Insulate exposed pipes before cold weather, especially in unheated spaces`,
        `Drain and protect outdoor hose bibs before winter`,
        `Flush your water heater annually to manage sediment and scale`,
        `Use drain strainers and avoid pouring grease down kitchen sinks`,
        `Schedule a plumbing inspection every 1–2 years, or annually for homes built in the ${d.pipeEra}`,
        `Address early signs of ${d.dominantFailure} before they escalate`,
      ],
    },
  ];
}

function waterHeaterBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessTip = d.hardnessPpm > 175
    ? `With ${d.hardnessPpm} mg/L hard water from ${d.waterUtility}, sediment and scale accumulate quickly in tank water heaters.`
    : d.hardnessPpm < 100
    ? `With ${d.hardnessPpm} mg/L softer water, corrosion of metal components can be a bigger concern than scale.`
    : `At ${d.hardnessPpm} mg/L, ${d.waterUtility} water is moderate and still benefits from annual flushing.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Water Heater Needs Repair in ${cityName}`,
      body: `Water heaters in ${cityName} fail gradually before they stop completely. ${hardnessTip} Watch for these signals:`,
      list: [
        `No hot water or water that never reaches the set temperature`,
        `Rusty, cloudy, or metallic-smelling hot water from taps`,
        `Rumbling, popping, or banging sounds during heating cycles`,
        `Water pooling under or around the base of the tank`,
        `Temperature and pressure relief valve dripping or discharging`,
        `Unit is 10 or more years old with declining performance`,
        `Fluctuating water temperature during showers or dishwashing`,
        `Error codes, reduced flow, or no ignition on tankless units`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Water Heater Repair in ${cityName}`,
      body: `Call for a licensed plumber in ${cityName} when the problem affects safety, comfort, or risks water damage. In ${statePhrase}, these situations should not wait:`,
      list: [
        `The tank is leaking or you see water under the unit`,
        `You have no hot water and the unit has power or gas supply`,
        `You smell gas near a gas water heater`,
        `Hot water is discolored but cold water runs clear`,
        `The unit is making loud rumbling or popping sounds`,
        `The TPR valve is discharging water continuously`,
        `A tankless unit shows an error code or fails to ignite`,
        `Water pressure drops only on hot water taps`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Safety Steps for a Failing Water Heater in ${cityName}`,
      body: `If your water heater is leaking, overheating, or making alarming noises, take these steps before the plumber arrives in ${cityName}:`,
      list: [
        `Turn off the gas supply valve for gas units, or flip the breaker for electric units`,
        `Shut the cold water supply valve above the tank`,
        `Open a nearby hot water tap to relieve pressure in the tank`,
        `Turn off electricity to the area if water is spreading toward outlets`,
        `Do not drain the tank unless you are confident in the procedure and have a safe drain path`,
        `Keep the area ventilated for gas units and leave the home if you smell gas`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Water Heater Repairs You Should Not DIY in ${cityName}`,
      body: `Water heaters combine water, pressure, gas, and electricity. In ${cityName} homes with ${d.pipeMaterial} plumbing, these repairs should be handled by a licensed pro:`,
      list: [
        `Replacing or adjusting the gas control valve or pilot assembly`,
        `Wiring or resetting thermostats and electrical heating elements`,
        `Replacing the temperature and pressure relief valve`,
        `Removing the anode rod or accessing the tank interior`,
        `Removing, disposing of, or installing a full water heater`,
        `Modifying venting, expansion tanks, or gas line connections`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Water Heater Repair in ${cityName}`,
      body: `A ${cityName} water heater repair visit is structured to diagnose accurately and avoid unnecessary replacement:`,
      list: [
        `Inspect the tank, connections, valves, venting, and fuel supply`,
        `Test electrical elements, gas burner, thermostat, and TPR valve`,
        `Identify whether the issue is a failed component, sediment, or tank failure`,
        `Provide a written quote for repair or replacement with clear options`,
        `Replace or repair the approved component using proper parts`,
        `Test operation, check for leaks, and verify safe venting and pressure`,
        `Clean the area and leave disposal and care instructions`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Water Heater Repairs in ${cityName}`,
      body: `Most water heater repairs in ${cityName} are completed in a single visit, though larger jobs can extend into the next day:`,
      ordered: true,
      list: [
        `Diagnosis takes 30 to 60 minutes depending on unit type`,
        `Thermostat, element, or anode rod replacement typically takes 1 to 2 hours`,
        `Tank flushing and descaling takes 1 to 2 hours`,
        `Tank water heater replacement takes 2 to 5 hours including removal and testing`,
        `Permit inspections or gas line upgrades may add a day in ${statePhrase}`,
        `Tankless descaling and calibration takes 1 to 2 hours`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects Water Heater Repair or Replacement Cost in ${cityName}`,
      body: `The cost of a water heater repair in ${cityName} depends on the unit, fuel type, and installation conditions — not just the part being replaced:`,
      list: [
        `Fuel type — gas, electric, or tankless — and venting requirements`,
        `Tank capacity and whether the current size meets household demand`,
        `Unit location and access, including attic, garage, or closet installations`,
        `Need for electrical, gas line, or venting upgrades to meet current code`,
        `Permit requirements in ${statePhrase} for replacement or gas work`,
        `Disposal of the old unit and any water damage cleanup`,
        `Local water hardness and scale buildup that may require additional cleaning`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Water Heater Maintenance for ${cityName} Homes`,
      body: `${hardnessTip} Regular maintenance extends the life of your water heater and reduces emergency calls in ${cityName}:`,
      list: [
        `Flush the tank at least once a year — twice a year if water is very hard`,
        `Inspect the anode rod every 3 to 5 years and replace when depleted`,
        `Test the temperature and pressure relief valve annually`,
        `Set the thermostat to 120°F for safety and efficiency`,
        `Check under and around the unit monthly for moisture or rust`,
        `Consider a water softener or descaling schedule if scale is a recurring issue`,
        `Insulate the first few feet of hot and cold pipes if ${cityName} sees occasional freezes`,
      ],
    },
  ];
}

function leakRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessNote = d.hardnessPpm > 175
    ? `Hard water at ${d.hardnessPpm} mg/L from ${d.waterUtility} accelerates pinhole corrosion in metal pipes.`
    : `Water at ${d.hardnessPpm} mg/L from ${d.waterUtility} contributes to gradual joint and fitting wear.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs of a Hidden or Active Leak in ${cityName}`,
      body: `Leaks in ${cityName} homes often start small and worsen over days or weeks. ${hardnessNote} Look for these indicators:`,
      list: [
        `Water bill increases without a change in usage habits`,
        `Damp or discolored patches on walls, ceilings, or baseboards`,
        `Musty or moldy odors in specific rooms or cabinets`,
        `Sound of running water when all fixtures are off`,
        `Warm spots on flooring, which may indicate a hot water line leak`,
        `Low water pressure at one or more fixtures`,
        `Cracks in walls or foundation that appear or grow over time`,
        `Pooled water near the water heater, under sinks, or around appliances`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call a Plumber for Leak Repair in ${cityName}`,
      body: `Call a licensed plumber in ${cityName} when you suspect or confirm a leak that is not easily stopped at a fixture:`,
      list: [
        `You hear water running but cannot identify the source`,
        `A wall or ceiling is damp, bulging, or showing signs of mold`,
        `Your water bill has spiked unexpectedly`,
        `Water pressure has dropped at multiple fixtures`,
        `You see visible water damage or staining that is spreading`,
        `A leak is behind a wall, under a slab, or in a crawl space`,
        `A fixture shutoff does not stop the leak`,
        `You suspect a slab leak — warm floors, foundation cracks, or unexplained moisture`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps When You Discover a Leak in ${cityName}`,
      body: `While waiting for a plumber in ${cityName}, take these steps to limit damage:`,
      list: [
        `Shut the nearest fixture shutoff valve if the leak is at a fixture`,
        `If the source is unknown, shut the main water valve`,
        `Turn off electricity to affected areas at the breaker if water is near wiring`,
        `Move furniture and belongings away from the wet area`,
        `Place buckets or towels to contain dripping water`,
        `Take photos of the damage for insurance purposes`,
        `Do not cut into walls or ceilings yourself if electrical wiring may be present`,
        `Note the time you first noticed the leak for your insurance claim`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Leak Repairs You Should Not Attempt in ${cityName}`,
      body: `Some leak repairs appear straightforward but carry hidden risks in ${cityName} homes with ${d.pipeMaterial}:`,
      list: [
        `Cutting into walls or ceilings to find a leak without verifying electrical locations`,
        `Using epoxy putty or pipe wrap as a permanent repair on pressurized lines`,
        `Tightening a corroded fitting that may crack or shear off`,
        `Attempting to access a slab leak by breaking through concrete yourself`,
        `Repairing a leak on the main supply line without proper tools or shutoff access`,
        `Ignoring a small leak because it seems minor — hidden moisture causes structural damage`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Leak Repair Visit in ${cityName}`,
      body: `A professional leak repair in ${cityName} follows a diagnostic-first process to avoid unnecessary demolition:`,
      list: [
        `The plumber listens to your description and inspects the visible signs`,
        `Diagnostic tools such as acoustic listening devices, moisture meters, or thermal imaging may be used`,
        `The leak is pinpointed before any wall, ceiling, or floor is opened`,
        `You receive a written quote with the repair approach and scope`,
        `The approved repair is performed with appropriate materials for ${d.pipeMaterial} systems`,
        `The system is pressurized and tested to confirm the repair holds`,
        `The work area is cleaned and the access point is documented for patching`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Leak Repairs in ${cityName}`,
      body: `Leak repair timelines in ${cityName} vary depending on the leak location and access:`,
      ordered: true,
      list: [
        `Initial inspection and leak detection takes 30 to 90 minutes`,
        `Accessible fixture leaks are often repaired in under an hour`,
        `Behind-wall leaks typically take 1 to 3 hours including access and repair`,
        `Slab leak diagnosis may take 2 to 4 hours with specialized equipment`,
        `Slab leak repair can take a full day depending on the reroute or tunneling approach`,
        `Final testing and cleanup add 30 to 60 minutes`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Leak Repair in ${cityName}`,
      body: `The cost of leak repair in ${cityName} depends on where the leak is and what is required to reach and fix it:`,
      list: [
        `Leak location — a visible under-sink leak costs less than a slab or behind-wall leak`,
        `Diagnostic method — acoustic, thermal, or pressure testing may be needed`,
        `Access requirements — opening walls, ceilings, or floors adds labor time`,
        `Pipe material and condition — older ${d.pipeMaterial} may require section replacement`,
        `Whether a localized repair or a longer section replacement is recommended`,
        `Restoration work such as drywall patching or floor repair after the plumbing fix`,
        `Emergency or after-hours service timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Leaks in ${cityName} Homes`,
      body: `Most leaks in ${cityName} can be prevented or caught early with routine attention. ${hardnessNote}`,
      list: [
        `Check under sinks and around appliances monthly for moisture`,
        `Inspect visible pipes for corrosion, mineral buildup, or green patina on copper`,
        `Monitor your water bill for unexplained increases`,
        `Replace washing machine hoses every 5 years with stainless steel braided hoses`,
        `Schedule a plumbing inspection every 1 to 2 years, especially for homes built in the ${d.pipeEra}`,
        `Test your main shutoff valve annually to ensure it operates freely`,
        `Watch for warm spots on floors that may indicate a hot water line leak under a slab`,
        `Address minor drips promptly before they worsen`,
      ],
    },
  ];
}

function drainCleaningBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessNote = d.hardnessPpm > 175
    ? `Hard water at ${d.hardnessPpm} mg/L from ${d.waterUtility} contributes to mineral scale buildup inside drain lines, narrowing pipes over time.`
    : `Even at ${d.hardnessPpm} mg/L, grease, soap scum, and food waste accumulate in drain lines.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs You Need Professional Drain Cleaning in ${cityName}`,
      body: `Drain problems in ${cityName} develop gradually. ${hardnessNote} Watch for these signs:`,
      list: [
        `Multiple drains are slow at the same time`,
        `Gurgling sounds from sinks, tubs, or toilets when water is running`,
        `Water backs up in one fixture when another is used`,
        `Foul odors coming from drains, especially in the kitchen or basement`,
        `Frequent need for store-bought drain cleaners`,
        `Toilet bubbles when the sink or tub drains`,
        `Standing water in the shower or tub that drains slowly`,
        `Sewage smell from a floor drain in the basement or laundry area`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Drain Cleaning in ${cityName}`,
      body: `Call a plumber in ${cityName} when home remedies are not resolving the problem or when multiple drains are affected:`,
      list: [
        `A single drain has been slow for more than a few days`,
        `Multiple drains are slow or backing up simultaneously`,
        `You hear gurgling from drains when other fixtures are used`,
        `Store-bought chemicals have not resolved the issue`,
        `Sewage or waste water is backing up into a fixture`,
        `A floor drain in the basement is overflowing or emitting odors`,
        `The same drain clogs repeatedly after being cleared`,
        `You suspect tree root intrusion in the main sewer line`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Drain Backup in ${cityName}`,
      body: `If a drain backup occurs in your ${cityName} home, take these precautions:`,
      list: [
        `Stop using all plumbing fixtures to prevent further backup`,
        `Do not run the dishwasher or washing machine`,
        `Avoid using chemical drain cleaners — they can worsen blockages and damage pipes`,
        `If sewage is entering living areas, keep children and pets away`,
        `Wear gloves and boots if you must enter the affected area`,
        `Turn off electricity to flooded areas if water reaches outlets`,
        `Do not attempt to open a main sewer cleanout yourself`,
        `Take photos of the backup for insurance documentation`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Drain Cleaning Methods to Avoid in ${cityName}`,
      body: `Some DIY drain cleaning approaches can damage ${d.pipeMaterial} plumbing or create safety hazards:`,
      list: [
        `Using chemical drain cleaners repeatedly — they corrode metal pipes and degrade plastic fittings`,
        `Pouring boiling water into PVC or CPVC drains — heat can soften joints`,
        `Using a plumber's snake without knowing the pipe layout — it can puncture or scratch pipes`,
        `Attempting to hydro-jet a drain without proper equipment and training`,
        `Opening a main sewer cleanout without containing the flow`,
        `Using a shop vacuum on sewage backups without proper filtration`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Professional Drain Cleaning in ${cityName}`,
      body: `A professional drain cleaning visit in ${cityName} is structured to clear the blockage and identify the cause:`,
      list: [
        `The plumber asks about the symptoms and which fixtures are affected`,
        `A drain snake or auger is used to clear the immediate blockage`,
        `For stubborn or recurring clogs, a camera inspection may be performed`,
        `Hydro-jetting may be recommended for heavy scale, grease, or root intrusion`,
        `The drain is tested for proper flow after clearing`,
        `The plumber explains the cause and recommends preventive steps`,
        `If a larger issue like root intrusion or pipe damage is found, a follow-up plan is discussed`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Drain Cleaning in ${cityName}`,
      body: `Most drain cleaning visits in ${cityName} are completed in a single appointment:`,
      ordered: true,
      list: [
        `Setup and assessment takes 15 to 30 minutes`,
        `Snaking a single drain line typically takes 30 to 60 minutes`,
        `Camera inspection adds 30 to 60 minutes if needed`,
        `Hydro-jetting a main line takes 1 to 3 hours depending on buildup severity`,
        `Testing and cleanup add 15 to 30 minutes`,
        `Same-day service is common for most drain cleaning calls`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Drain Cleaning in ${cityName}`,
      body: `The cost of drain cleaning in ${cityName} depends on the severity, location, and method required:`,
      list: [
        `Number of affected drains — a single sink clog costs less than a main line backup`,
        `Method used — snaking is less expensive than hydro-jetting or camera inspection`,
        `Severity and location of the blockage`,
        `Whether tree root intrusion is present, which may require ongoing treatment`,
        `Access difficulty — cleanouts in tight spaces or buried locations add time`,
        `Emergency or after-hours timing`,
        `Whether a recurring issue indicates a deeper problem requiring camera diagnosis`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Drain Clogs in ${cityName} Homes`,
      body: `Most drain clogs in ${cityName} are preventable with good habits and routine maintenance. ${hardnessNote}`,
      list: [
        `Use drain strainers in kitchen and bathroom sinks to catch debris`,
        `Never pour grease, oil, or fat down the drain — collect in a container and dispose in trash`,
        `Run hot water through kitchen drains after each use to help dissolve soap residue`,
        `Avoid putting fibrous foods like celery, onion skins, and corn husks in the garbage disposal`,
        `Schedule professional drain cleaning every 1 to 2 years as preventive maintenance`,
        `Consider an enzyme-based drain treatment monthly to break down organic buildup`,
        `If you have mature trees near your sewer line, schedule a camera inspection every few years`,
        `Teach household members what should and should not go down each drain`,
      ],
    },
  ];
}

function pipeBurstBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const winterNote = d.winterRisk === 'high'
    ? `${cityName} experiences hard freezes with winter lows around ${d.avgWinterTempF}°F, making burst pipes a significant seasonal risk.`
    : d.winterRisk === 'med'
    ? `${cityName} occasionally experiences cold snaps that can freeze unprotected pipes.`
    : `While ${cityName} rarely freezes, pipes in unheated spaces can still burst from pressure or age-related failure.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs of a Burst Pipe in ${cityName}`,
      body: `A burst pipe is one of the most damaging plumbing failures a ${cityName} homeowner can face. ${winterNote} Watch for:`,
      list: [
        `A sudden drop in water pressure throughout the home`,
        `Water spraying, dripping, or gushing from a wall, ceiling, or floor`,
        `Damp or discolored patches appearing suddenly on walls or ceilings`,
        `The sound of running water when all fixtures are turned off`,
        `Frost or ice visible on exposed pipes during cold weather`,
        `No water at all from one or more fixtures during freezing temperatures`,
        `Unexplained pooling of water in the yard, which may indicate a buried line burst`,
        `A sudden increase in your water meter reading when no water is being used`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Burst Pipe Repair in ${cityName}`,
      body: `A burst pipe is an emergency. Call a plumber in ${cityName} immediately if:`,
      list: [
        `Water is actively leaking from a wall, ceiling, or floor`,
        `You have no water and suspect a frozen or burst pipe`,
        `Your water meter is spinning when all fixtures are off`,
        `Water is spreading toward electrical outlets, panels, or appliances`,
        `A fixture shutoff does not stop the leak`,
        `You cannot locate or turn the main water shutoff valve`,
        `Multiple fixtures have lost pressure or stopped working`,
        `You see frost on pipes and hear water running inside walls`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Burst Pipe in ${cityName}`,
      body: `Every minute counts when a pipe bursts. Take these steps immediately while waiting for a plumber in ${cityName}:`,
      list: [
        `Shut the main water valve — this is the single most important step`,
        `Open faucets to drain remaining water and relieve pressure from the system`,
        `Turn off electricity to affected areas at the breaker panel if water is near wiring`,
        `If you smell gas, leave the home and call from outside`,
        `Move valuables, electronics, and furniture away from the water path`,
        `Place buckets or towels to contain dripping water`,
        `If the pipe is frozen, do not use open flames or heat guns to thaw it`,
        `Take photos and video for insurance documentation`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Burst Pipe Repairs You Should Not DIY in ${cityName}`,
      body: `Burst pipes require professional repair. In ${cityName} homes with ${d.pipeMaterial}, do not attempt:`,
      list: [
        `Wrapping a burst pipe with tape, epoxy, or rubber and considering it a permanent fix`,
        `Using a torch or heat gun to thaw a frozen pipe — fire risk is high`,
        `Cutting into walls to find the burst without verifying electrical line locations`,
        `Replacing a section of pipe without proper fittings, soldering, or crimping tools`,
        `Repairing a burst on the main supply line without shutoff access`,
        `Turning the water back on before the repair is tested and verified`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Burst Pipe Repair in ${cityName}`,
      body: `A burst pipe repair in ${cityName} is treated as an emergency and follows a rapid-response process:`,
      list: [
        `The plumber verifies the water is shut off and the area is safe`,
        `The burst section is located — visually, with moisture detection, or by tracing the leak path`,
        `The damaged section is cut out and the pipe is inspected for additional splits`,
        `A new section is installed using appropriate methods for ${d.pipeMaterial}`,
        `The system is pressurized and checked for leaks at the repair point`,
        `Insulation is checked or added if the burst was caused by freezing`,
        `The plumber documents the repair and provides guidance on preventing recurrence`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for a Burst Pipe Repair in ${cityName}`,
      body: `Burst pipe repairs in ${cityName} are prioritized as emergencies:`,
      ordered: true,
      list: [
        `Emergency dispatch targets arrival within 60 minutes`,
        `Water shutoff and stabilization takes 15 to 30 minutes`,
        `Locating the burst and accessing the pipe takes 30 to 90 minutes depending on location`,
        `The actual pipe repair takes 1 to 3 hours for accessible bursts`,
        `Behind-wall or under-slab repairs may take 3 to 6 hours`,
        `Testing, insulation check, and cleanup add 30 to 60 minutes`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Burst Pipe Repair in ${cityName}`,
      body: `The cost of a burst pipe repair in ${cityName} depends on the pipe location, material, and extent of damage:`,
      list: [
        `Pipe location — an exposed pipe in a basement costs less than one behind a wall or under a slab`,
        `Pipe material — ${d.pipeMaterial} requires specific fittings and joining methods`,
        `Length of pipe that needs replacement — a small section vs a long run`,
        `Access difficulty — opening walls, ceilings, or floors adds labor and restoration costs`,
        `Water damage remediation — drying, dehumidification, or mold prevention may be needed`,
        `Emergency or after-hours timing`,
        `Whether insulation or pipe heating needs to be added to prevent recurrence`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Burst Pipes in ${cityName}`,
      body: `Burst pipes are largely preventable. ${winterNote}`,
      list: [
        `Insulate all exposed pipes in unheated areas — crawl spaces, garages, and attics`,
        `Disconnect and drain outdoor hoses before cold weather`,
        `Install insulated covers on outdoor hose bibs`,
        `Keep garage doors closed during cold weather to protect plumbing in adjacent walls`,
        `Let a faucet drip during extreme cold to relieve pressure in the system`,
        `Know where your main shutoff valve is and test it annually`,
        `If leaving home during winter, keep the thermostat no lower than 55°F`,
        `Schedule a plumbing inspection before winter to identify vulnerable pipes`,
      ],
    },
  ];
}

function sewerLineRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const soilNote = `The ${d.soilType} beneath ${cityName} can shift seasonally, placing stress on buried sewer lines.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs of Sewer Line Problems in ${cityName}`,
      body: `Sewer line issues in ${cityName} develop slowly and often go unnoticed until a backup occurs. ${soilNote} Watch for:`,
      list: [
        `Multiple drains backing up at the same time`,
        `Gurgling sounds from toilets and drains throughout the house`,
        `Sewage odor inside or outside the home`,
        `Lush, unusually green patches in the yard above the sewer line`,
        `Slow drains throughout the house that do not respond to cleaning`,
        `Water backing up in the tub or shower when the toilet is flushed`,
        `Foundation cracks or settling that may indicate a leaking sewer line`,
        `Frequent need for drain cleaning in the main line`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Sewer Line Repair in ${cityName}`,
      body: `Sewer line problems require professional attention. Call a plumber in ${cityName} when:`,
      list: [
        `Multiple fixtures are backing up simultaneously`,
        `You smell sewage inside or outside the home`,
        `A drain cleaning has not resolved recurring backups`,
        `You see unexplained wet or sunken areas in the yard`,
        `The toilet gurgles or bubbles when other fixtures are used`,
        `A camera inspection has identified cracks, root intrusion, or pipe separation`,
        `Your home is over 40 years old and the sewer line has never been inspected`,
        `You are experiencing frequent main line clogs`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Sewer Backup in ${cityName}`,
      body: `A sewer backup is a biohazard. Take these precautions in your ${cityName} home:`,
      list: [
        `Stop using all plumbing fixtures immediately`,
        `Keep children and pets away from any area with sewage`,
        `Wear rubber gloves and boots if you must enter the affected area`,
        `Turn off electricity to flooded areas at the breaker`,
        `Do not attempt to open the main sewer cleanout — sewage may pour out under pressure`,
        `Ventilate the area by opening windows if possible`,
        `Do not flush toilets or run water until the problem is resolved`,
        `Contact your insurance company — sewer backups may require specific coverage`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Sewer Line Repairs You Should Not DIY in ${cityName}`,
      body: `Sewer line work involves buried pipes, potential biohazard exposure, and often requires permits in ${statePhrase}:`,
      list: [
        `Opening a main sewer cleanout without professional containment`,
        `Using a power snake on the main line without knowing the pipe condition`,
        `Digging in the yard without having utility lines marked first`,
        `Attempting to repair or replace a section of buried sewer pipe yourself`,
        `Using chemical drain cleaners on a sewer backup — they are ineffective and hazardous`,
        `Ignoring a recurring backup — sewer line damage worsens over time`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Sewer Line Repair in ${cityName}`,
      body: `A sewer line repair in ${cityName} begins with diagnosis and may involve trenchless or traditional methods:`,
      list: [
        `A camera inspection is performed to locate the damage and assess pipe condition`,
        `The plumber identifies whether the issue is root intrusion, pipe collapse, offset joints, or cracks`,
        `Options are presented — spot repair, pipe bursting, or pipe lining — with written quotes`,
        `If excavation is needed, utility lines are marked before digging`,
        `The approved repair is performed using appropriate methods for the pipe material and depth`,
        `The line is camera-inspected again to verify the repair`,
        `The site is restored and the plumber documents the work for your records`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Sewer Line Repairs in ${cityName}`,
      body: `Sewer line repair timelines in ${cityName} vary significantly based on the method and scope:`,
      ordered: true,
      list: [
        `Camera inspection and diagnosis takes 1 to 2 hours`,
        `Spot repair via excavation typically takes 1 to 2 days`,
        `Trenchless pipe lining can often be completed in 1 day`,
        `Trenchless pipe bursting usually takes 1 to 2 days`,
        `Permit processing in ${statePhrase} may add several days`,
        `Final inspection and site restoration add 1 to 2 days for traditional excavation`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Sewer Line Repair in ${cityName}`,
      body: `Sewer line repair costs in ${cityName} depend on the damage, method, and pipe depth:`,
      list: [
        `Repair method — trenchless lining or bursting vs traditional excavation`,
        `Length of pipe that needs repair or replacement`,
        `Depth of the sewer line — deeper lines require more excavation`,
        `Cause of damage — root intrusion, pipe collapse, or joint separation`,
        `Access — whether equipment can reach the repair area easily`,
        `Permit and inspection requirements in ${statePhrase}`,
        `Restoration of landscaping, driveways, or hardscaping after excavation`,
        `Whether a cleanout needs to be installed for future access`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Sewer Line Problems in ${cityName}`,
      body: `Sewer line failures in ${cityName} can often be prevented or caught early. ${soilNote}`,
      list: [
        `Schedule a sewer camera inspection every 3 to 5 years, or sooner if you have mature trees`,
        `Avoid planting trees with aggressive root systems near the sewer line path`,
        `Do not flush anything except toilet paper — no wipes, even "flushable" ones`,
        `Use enzyme-based drain treatments to break down organic buildup in the main line`,
        `If you have had root intrusion, consider an annual root cutting treatment`,
        `Install a backwater valve if your home is in a low-lying area prone to sewer backups`,
        `Know where your main sewer cleanout is located for emergency access`,
        `Watch for early warning signs like slow drains and gurgling before a backup occurs`,
      ],
    },
  ];
}

function toiletRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessNote = d.hardnessPpm > 175
    ? `Hard water at ${d.hardnessPpm} mg/L from ${d.waterUtility} causes mineral buildup in toilet fill valves and flush mechanisms.`
    : `Water at ${d.hardnessPpm} mg/L can still leave deposits that affect toilet components over time.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Toilet Needs Repair in ${cityName}`,
      body: `Toilet problems in ${cityName} homes range from minor annoyances to water-wasting failures. ${hardnessNote} Look for:`,
      list: [
        `The toilet runs continuously or cycles on and off without being flushed`,
        `Water is pooling around the base of the toilet`,
        `The toilet rocks or shifts when you sit down`,
        `The flush is weak or incomplete — waste does not clear in one flush`,
        `You hear water refilling the tank when no one has flushed`,
        `The handle is loose, sticks, or must be held down to flush`,
        `Water rises unusually high in the bowl before draining`,
        `A visible crack in the tank or bowl`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Toilet Repair in ${cityName}`,
      body: `Call a plumber in ${cityName} when the problem is beyond a simple flapper adjustment:`,
      list: [
        `Water is leaking from the base — this may indicate a failed wax ring`,
        `The toilet runs continuously and adjusting the fill valve has not helped`,
        `The toilet rocks or moves, which can break the wax seal`,
        `The bowl or tank is cracked`,
        `The flush is consistently weak and a plunger does not help`,
        `You hear water running but cannot identify the source inside the tank`,
        `Multiple toilets in the home are having problems at the same time`,
        `The toilet is old and you want to upgrade to a water-efficient model`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Toilet Problem in ${cityName}`,
      body: `If your toilet is leaking or overflowing in ${cityName}, take these steps:`,
      list: [
        `Shut the toilet shutoff valve, usually on the wall behind the toilet`,
        `If the valve is seized, remove the tank lid and lift the float to stop water flow`,
        `If water is overflowing the bowl, turn off the shutoff and mop up the water`,
        `If sewage is backing up through the toilet, stop using all fixtures and call a plumber`,
        `Place towels around the base if water is leaking there`,
        `Do not use chemical drain cleaners in a toilet — they can damage the wax seal and pipes`,
        `If the toilet is rocking, avoid using it until it is resealed`,
        `Note when the problem started for the plumber`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Toilet Repairs You Should Not DIY in ${cityName}`,
      body: `Some toilet repairs seem simple but can cause leaks or damage if done incorrectly in ${cityName} homes:`,
      list: [
        `Removing and resetting a toilet to replace the wax ring — improper sealing leads to leaks`,
        `Caulking around the base to hide a leak instead of fixing the wax ring`,
        `Using a snake or auger in the toilet without care — porcelain can crack`,
        `Replacing the flush valve or fill valve without shutting the water off first`,
        `Overtightening tank bolts, which can crack the porcelain`,
        `Using chemical drain cleaners to clear a toilet clog — they can damage the wax seal`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Toilet Repair Visit in ${cityName}`,
      body: `A toilet repair visit in ${cityName} is typically straightforward and completed in one appointment:`,
      list: [
        `The plumber inspects the toilet, tank components, and connections`,
        `The fill valve, flush valve, flapper, and handle are tested`,
        `If the base is leaking, the toilet is removed and the wax ring is replaced`,
        `If the toilet is rocking, the flange is inspected and repaired or shimmed`,
        `The approved repair is completed with proper parts`,
        `The toilet is tested for proper flush, fill, and no leaks`,
        `The area is cleaned and the old parts are removed`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Toilet Repairs in ${cityName}`,
      body: `Most toilet repairs in ${cityName} are quick and completed in a single visit:`,
      ordered: true,
      list: [
        `Diagnosis and inspection takes 15 to 30 minutes`,
        `Flapper, fill valve, or handle replacement takes 30 to 45 minutes`,
        `Flush valve replacement takes 45 to 90 minutes`,
        `Wax ring replacement and toilet reset takes 1 to 2 hours`,
        `Flange repair adds 1 to 2 hours depending on access`,
        `Toilet replacement takes 1 to 2 hours including removal and installation`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Toilet Repair in ${cityName}`,
      body: `Toilet repair costs in ${cityName} depend on the problem and whether replacement is more cost-effective:`,
      list: [
        `Type of repair — a flapper replacement costs less than a wax ring or flange repair`,
        `Whether the toilet needs to be removed and reinstalled`,
        `Condition of the flange — a corroded or broken flange adds repair time`,
        `Whether the toilet is cracked and needs full replacement`,
        `Quality and features of a replacement toilet if upgrading`,
        `Water supply line replacement if the existing line is corroded or leaking`,
        `Emergency or after-hours service timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Toilet Problems in ${cityName}`,
      body: `Most toilet failures in ${cityName} can be prevented with simple maintenance. ${hardnessNote}`,
      list: [
        `Inspect the flapper every 1 to 2 years and replace if it shows wear or mineral buildup`,
        `Check the fill valve periodically for proper water level adjustment`,
        `Do not use chemical drain cleaners in toilets — use a plunger or toilet auger instead`,
        `Never flush wipes, feminine hygiene products, or paper towels`,
        `Check the water supply line for signs of corrosion or bulging`,
        `If the toilet rocks, have it reseated promptly before the wax seal fails`,
        `Clean mineral deposits from the rim holes and jet hole to maintain flush performance`,
        `Consider upgrading to a WaterSense-labeled toilet if yours is over 15 years old`,
      ],
    },
  ];
}

function slabLeakRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const soilNote = `The ${d.soilType} under ${cityName} homes can shift and place stress on pipes embedded in or beneath the foundation.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs of a Slab Leak in ${cityName}`,
      body: `Slab leaks are among the most difficult plumbing problems to detect in ${cityName} homes. ${soilNote} Watch for:`,
      list: [
        `Warm spots on the floor, which may indicate a hot water line leak under the slab`,
        `Unexplained increase in your water bill`,
        `Sound of running water when all fixtures are off`,
        `Cracks in walls or flooring that appear or worsen over time`,
        `Damp or wet areas on the floor with no visible source`,
        `Low water pressure at one or more fixtures`,
        `Mold or mildew appearing at the base of walls`,
        `Your water meter is running when no water is being used`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Slab Leak Repair in ${cityName}`,
      body: `Slab leaks require immediate professional attention. Call a plumber in ${cityName} if:`,
      list: [
        `You feel warm spots on the floor`,
        `Your water bill has spiked with no explanation`,
        `You hear water running when nothing is turned on`,
        `You see cracks in walls or floors that are new or growing`,
        `Your water meter is running when all fixtures are off`,
        `You notice unexplained moisture or mold at the base of walls`,
        `Water pressure has dropped at multiple fixtures`,
        `You have had a previous slab leak and want a preventive inspection`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps When You Suspect a Slab Leak in ${cityName}`,
      body: `If you suspect a slab leak in your ${cityName} home, take these steps:`,
      list: [
        `Shut the main water valve to stop further water loss`,
        `Turn off electricity to any area where water may be reaching outlets or wiring`,
        `Move furniture and belongings away from damp or warm floor areas`,
        `Place towels or buckets to contain any visible water`,
        `Check your water meter — if it is running with the main off, the leak is on the house side`,
        `Do not attempt to break through the slab yourself`,
        `Take photos of any visible damage for insurance`,
        `Call a plumber who specializes in slab leak detection and repair`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Slab Leak Repairs You Should Not DIY in ${cityName}`,
      body: `Slab leaks require specialized detection equipment and professional repair. In ${cityName}, do not attempt:`,
      list: [
        `Breaking through the concrete slab to find the leak yourself`,
        `Using a store-bought listening device without training`,
        `Ignoring the signs because the damage is not yet visible — water undermines the foundation`,
        `Attempting to reroute pipes without understanding the plumbing layout`,
        `Using epoxy or internal pipe coatings as a DIY fix`,
        `Delaying the call — slab leaks worsen and can cause structural damage`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Slab Leak Repair in ${cityName}`,
      body: `Slab leak repair in ${cityName} begins with precise detection and may involve rerouting or direct access:`,
      list: [
        `Electronic leak detection equipment is used to pinpoint the leak under the slab`,
        `The plumber confirms whether the leak is on the hot or cold line and its exact location`,
        `Options are presented — direct access (breaking through the slab) or pipe rerouting above the slab`,
        `A written quote is provided with the recommended approach`,
        `The approved repair is performed with minimal disruption`,
        `The system is pressurized and tested to confirm the leak is resolved`,
        `The access point is documented for concrete or flooring restoration`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Slab Leak Repairs in ${cityName}`,
      body: `Slab leak repair in ${cityName} is a multi-step process:`,
      ordered: true,
      list: [
        `Leak detection takes 2 to 4 hours with specialized equipment`,
        `Direct access repair through the slab takes 1 to 2 days including concrete removal and pipe repair`,
        `Pipe rerouting above the slab typically takes 1 to 2 days and avoids breaking concrete`,
        `Pressure testing and verification take 1 to 2 hours`,
        `Concrete patching and floor restoration add 1 to 3 days depending on the finish`,
        `Total project time ranges from 2 to 5 days for most slab leak repairs`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Slab Leak Repair in ${cityName}`,
      body: `Slab leak repair costs in ${cityName} depend on the detection, repair method, and restoration needs:`,
      list: [
        `Detection method — electronic, acoustic, or pressure testing`,
        `Repair approach — direct access through the slab vs pipe rerouting`,
        `Location of the leak — under a bathroom, kitchen, or hallway affects access difficulty`,
        `Number of leaks — sometimes multiple leaks are found`,
        `Pipe material — ${d.pipeMaterial} may require specific repair methods`,
        `Flooring type that needs to be removed and restored — tile, hardwood, or carpet`,
        `Concrete removal and repatching`,
        `Whether water damage remediation is needed under the slab`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Slab Leaks in ${cityName}`,
      body: `Slab leaks cannot always be prevented, but you can reduce the risk in ${cityName} homes. ${soilNote}`,
      list: [
        `Monitor your water bill monthly for unexplained increases`,
        `Check your water meter periodically when all fixtures are off`,
        `Schedule a plumbing inspection every 1 to 2 years for homes built in the ${d.pipeEra}`,
        `Maintain consistent soil moisture around the foundation to minimize ground movement`,
        `Address any plumbing leaks promptly — small leaks under slabs worsen over time`,
        `Consider a whole-house pressure regulator if your water pressure exceeds 80 psi`,
        `Be aware that ${d.pipeMaterial} pipes under slabs have a finite service life`,
        `If you have had one slab leak, ask about preventive pipe rerouting for vulnerable lines`,
      ],
    },
  ];
}

function waterLineRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const pipeNote = `Homes in ${cityName} with ${d.pipeMaterial} from the ${d.pipeEra} may experience water line degradation as the system ages.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs of a Water Line Problem in ${cityName}`,
      body: `Your main water line delivers all the fresh water to your home. ${pipeNote} Watch for these signs:`,
      list: [
        `A sudden drop in water pressure throughout the entire house`,
        `Water pooling in the yard or near the street, even in dry weather`,
        `An unexplained increase in your water bill`,
        `Discolored or rusty water from all taps`,
        `A hissing or humming sound from walls or floors where the main line runs`,
        `Water meter running when all fixtures are off`,
        `Wet or soggy patches in the lawn along the path of the water line`,
        `Foundation cracks or settling that may indicate water line leakage`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Water Line Repair in ${cityName}`,
      body: `Call a licensed plumber in ${cityName} when you suspect a problem with your main water line:`,
      list: [
        `Water pressure has dropped throughout the house`,
        `You see water pooling in the yard with no obvious source`,
        `Your water bill has increased without a change in usage`,
        `Water is discolored or has an unusual taste or odor`,
        `The water meter is running when all fixtures are off`,
        `You hear water running inside walls or floors`,
        `You are planning a renovation and want the line inspected first`,
        `Your home is over 30 years old and the water line has never been replaced`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Suspected Water Line Failure in ${cityName}`,
      body: `If you suspect your water line is leaking or has burst in ${cityName}:`,
      list: [
        `Shut the main water valve at the house or at the street`,
        `Check your water meter — if it is still running with the main off, the leak is between the meter and the house`,
        `Turn off electricity to any area where water is reaching wiring`,
        `Avoid using hot water — a leak on the main line can drain the water heater`,
        `Move belongings away from areas where water is entering the home`,
        `Take photos of any visible water or damage for insurance`,
        `Call the water utility if you suspect the leak is on their side of the meter`,
        `Do not attempt to dig up the water line yourself`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Water Line Repairs You Should Not DIY in ${cityName}`,
      body: `Main water line repairs require professional tools, permits, and coordination with the local utility in ${cityName}:`,
      list: [
        `Digging up the water line without having utility lines marked`,
        `Repairing or replacing the main water line without a permit in ${statePhrase}`,
        `Using a pipe repair clamp as a permanent fix on a buried line`,
        `Connecting new pipe to old without proper fittings for ${d.pipeMaterial}`,
        `Attempting to turn a seized street-side shutoff valve without proper tools`,
        `Backfilling a repair trench without proper compaction and inspection`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Water Line Repair in ${cityName}`,
      body: `A water line repair in ${cityName} follows a structured process from diagnosis to restoration:`,
      list: [
        `The plumber confirms the leak location using pressure testing or visual inspection`,
        `Utility lines are marked before any excavation begins`,
        `The affected section of pipe is exposed and assessed`,
        `A written quote is provided with the repair or replacement options`,
        `The approved repair is performed using materials compatible with ${d.pipeMaterial}`,
        `The line is pressure-tested and checked for leaks before backfilling`,
        `The trench is backfilled and compacted, and the site is restored`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Water Line Repairs in ${cityName}`,
      body: `Water line repair in ${cityName} typically takes one to two days:`,
      ordered: true,
      list: [
        `Leak detection and diagnosis takes 1 to 3 hours`,
        `Utility marking may take 1 to 2 days to schedule`,
        `Excavation and repair of an accessible section takes 4 to 8 hours`,
        `Full water line replacement takes 1 to 2 days depending on length and depth`,
        `Pressure testing and inspection add 1 to 2 hours`,
        `Backfilling and site restoration take 2 to 4 hours`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Water Line Repair in ${cityName}`,
      body: `Water line repair costs in ${cityName} depend on the scope and conditions of the project:`,
      list: [
        `Length of pipe that needs repair or replacement`,
        `Depth of the water line — deeper lines require more excavation`,
        `Pipe material — ${d.pipeMaterial} requires specific fittings and joining methods`,
        `Whether a section repair or full replacement is recommended`,
        `Access — landscaping, driveways, or hardscaping that must be removed and restored`,
        `Permit and inspection requirements in ${statePhrase}`,
        `Utility coordination if the repair involves the connection at the street`,
        `Emergency or after-hours timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Water Line Problems in ${cityName}`,
      body: `Water line failures in ${cityName} are often age-related. ${pipeNote}`,
      list: [
        `Monitor your water bill for unexplained increases`,
        `Check your water meter periodically when all fixtures are off`,
        `Schedule a plumbing inspection every 1 to 2 years for older homes`,
        `Maintain proper grading around the foundation to direct water away from the line`,
        `Avoid planting trees with aggressive roots near the water line path`,
        `If your home has original ${d.pipeMaterial} from the ${d.pipeEra}, consider planning for eventual replacement`,
        `Install a pressure regulator if your water pressure exceeds 80 psi`,
        `Know where your main shutoff is and test it annually`,
      ],
    },
  ];
}

function faucetRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessNote = d.hardnessPpm > 175
    ? `Hard water at ${d.hardnessPpm} mg/L from ${d.waterUtility} causes mineral scale on faucet cartridges, aerators, and internal seals.`
    : `Water at ${d.hardnessPpm} mg/L can still leave deposits that degrade faucet components over time.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Faucet Needs Repair in ${cityName}`,
      body: `Faucet problems in ${cityName} homes waste water and often worsen gradually. ${hardnessNote} Look for:`,
      list: [
        `A persistent drip even when the handle is fully closed`,
        `Reduced water flow or uneven spray from the spout`,
        `Squeaking, grinding, or stiffness when turning the handle`,
        `Water leaking from the base of the handle or spout`,
        `Mineral buildup visible on the aerator or spout`,
        `Hot and cold water mixing unexpectedly — temperature is hard to control`,
        `A spray hose that leaks, retracts poorly, or does not shut off completely`,
        `Corrosion or green patina on metal faucet components`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Faucet Repair in ${cityName}`,
      body: `Call a plumber in ${cityName} when the faucet problem is beyond a simple aerator clean or O-ring replacement:`,
      list: [
        `The faucet drips continuously and replacing the cartridge has not helped`,
        `Water is leaking from under the sink or at the handle base`,
        `The faucet handle is difficult to turn or feels loose`,
        `Water pressure from one faucet is significantly lower than others`,
        `You hear a hammering or banging sound when the faucet is turned off`,
        `The spray hose is leaking or will not retract`,
        `You want to upgrade to a water-efficient faucet and need professional installation`,
        `Multiple faucets in the home are having problems simultaneously`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Leaking Faucet in ${cityName}`,
      body: `If a faucet is leaking or malfunctioning in your ${cityName} home:`,
      list: [
        `Shut the hot and cold shutoff valves under the sink`,
        `If the under-sink valves are seized, shut the main water valve`,
        `Place a towel or bucket under the faucet to catch drips`,
        `Do not force a stuck handle — it can break the stem or cartridge`,
        `Avoid using the faucet until it is repaired to prevent further water waste`,
        `If water is leaking under the sink, remove items from the cabinet to prevent damage`,
        `Note which handle (hot or cold) the leak seems to come from`,
        `Take a photo of the faucet brand and model if available for the plumber`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Faucet Repairs You Should Not DIY in ${cityName}`,
      body: `Some faucet repairs seem simple but can cause damage if done incorrectly in ${cityName} homes:`,
      list: [
        `Forcing a corroded handle off — it can break the stem or crack the faucet body`,
        `Using the wrong cartridge or stem for your faucet model`,
        `Overtightening connections under the sink, which can crack plastic or brass fittings`,
        `Replacing a faucet without shutting the water off first`,
        `Using plumber's putty where silicone is required, or vice versa`,
        `Ignoring a slow leak — it wastes hundreds of gallons and can cause cabinet damage`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Faucet Repair Visit in ${cityName}`,
      body: `A faucet repair in ${cityName} is typically a quick, single-visit service:`,
      list: [
        `The plumber identifies the faucet brand and model`,
        `The shutoff valves under the sink are tested and the water is turned off`,
        `The handle, cartridge or stem, and internal seals are inspected`,
        `The aerator and spout are checked for mineral buildup`,
        `The faulty component is replaced with the correct part`,
        `The faucet is reassembled and tested for proper operation and no leaks`,
        `The plumber cleans the area and removes old parts`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Faucet Repairs in ${cityName}`,
      body: `Most faucet repairs in ${cityName} are completed in under two hours:`,
      ordered: true,
      list: [
        `Diagnosis and identification takes 15 to 30 minutes`,
        `Cartridge or stem replacement takes 30 to 60 minutes`,
        `Aerator cleaning or replacement takes 10 to 20 minutes`,
        `Full faucet replacement takes 1 to 2 hours including removal and new installation`,
        `Supply line replacement adds 15 to 30 minutes if lines are corroded`,
        `Testing and cleanup add 10 to 15 minutes`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Faucet Repair in ${cityName}`,
      body: `Faucet repair costs in ${cityName} depend on the problem, faucet type, and parts required:`,
      list: [
        `Type of repair — a cartridge replacement costs more than an aerator clean`,
        `Faucet brand and model — some cartridges are proprietary and more expensive`,
        `Whether the faucet needs full replacement vs repair`,
        `Condition of the shutoff valves under the sink — seized valves may need replacement`,
        `Supply line condition — corroded lines should be replaced during the visit`,
        `Whether the sink or countertop needs modification for a new faucet`,
        `Emergency or after-hours service timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Faucet Problems in ${cityName}`,
      body: `Most faucet failures in ${cityName} can be delayed with simple maintenance. ${hardnessNote}`,
      list: [
        `Clean aerators every 6 months by soaking in vinegar to dissolve mineral deposits`,
        `Replace faucet cartridges or stems at the first sign of dripping rather than waiting`,
        `Do not force handles — if a handle is stiff, the cartridge may need lubrication or replacement`,
        `Check under-sink supply lines annually for corrosion or bulging`,
        `Test shutoff valves under sinks once a year to ensure they turn freely`,
        `Consider a water softener if hard water is causing recurring scale issues`,
        `Avoid using abrasive cleaners on faucet finishes — use mild soap and water`,
        `Replace old faucets with WaterSense-labeled models to save water and reduce wear`,
      ],
    },
  ];
}

function garbageDisposalRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessNote = d.hardnessPpm > 175
    ? `Hard water at ${d.hardnessPpm} mg/L from ${d.waterUtility} can cause mineral buildup on the grinding components and reduce disposal efficiency.`
    : `Water at ${d.hardnessPpm} mg/L has minimal scale impact, but food waste and grease are the primary causes of disposal problems.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Garbage Disposal Needs Repair in ${cityName}`,
      body: `Garbage disposal problems in ${cityName} homes usually start with minor symptoms. ${hardnessNote} Watch for:`,
      list: [
        `The disposal hums but does not grind — the flywheel may be jammed`,
        `Water is backing up into the sink when the disposal runs`,
        `The disposal does not turn on at all — no sound when the switch is flipped`,
        `Unusual noises such as metal-on-metal clanking or rattling`,
        `Foul odors that persist after cleaning`,
        `Water leaking from the bottom of the unit or at the mounting flange`,
        `The disposal trips the breaker repeatedly`,
        `Slow draining that worsens when the disposal is running`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Garbage Disposal Repair in ${cityName}`,
      body: `Call a plumber in ${cityName} when the disposal problem is beyond a simple reset or jam clearing:`,
      list: [
        `The disposal hums but does not turn, and the reset button does not help`,
        `The unit is leaking from the bottom or at the sink flange`,
        `The breaker trips every time the disposal is turned on`,
        `Water backs up into the sink when the disposal runs`,
        `You hear metal-on-metal grinding noises`,
        `The disposal has been jammed multiple times and the problem keeps recurring`,
        `The unit is over 10 years old and showing multiple symptoms`,
        `You smell burning or see smoke when the disposal runs`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Garbage Disposal Problem in ${cityName}`,
      body: `If your garbage disposal is malfunctioning in ${cityName}, take these precautions:`,
      list: [
        `Turn off the disposal switch immediately`,
        `Do not reach into the disposal with your hands — even if it is off`,
        `If the unit is jammed, do not force it — turn off the power at the breaker`,
        `If water is backing up, stop running the sink and do not use the dishwasher`,
        `If you smell burning or see smoke, turn off the breaker and do not use the unit`,
        `If the unit is leaking, place a bucket under it and shut the water to the sink`,
        `Do not use chemical drain cleaners — they can damage the disposal seals`,
        `Check the reset button on the bottom of the unit only after the power is off`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Garbage Disposal Repairs You Should Not DIY in ${cityName}`,
      body: `Garbage disposals combine water, electricity, and grinding mechanisms. In ${cityName} homes, do not attempt:`,
      list: [
        `Reaching into the grinding chamber without the power being off at the breaker`,
        `Disassembling the disposal motor or internal grinding components`,
        `Wiring or rewiring the disposal without proper electrical knowledge`,
        `Using a wrench on the flywheel without first confirming the power is off`,
        `Replacing the disposal without proper plumbing and electrical connections`,
        `Using chemical cleaners to clear a disposal clog — they can degrade internal seals`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Garbage Disposal Repair in ${cityName}`,
      body: `A garbage disposal repair visit in ${cityName} is structured to diagnose and fix the problem efficiently:`,
      list: [
        `The plumber turns off power to the disposal at the breaker`,
        `The unit is inspected for jams, leaks, and electrical issues`,
        `The flywheel is checked and freed if jammed using a disposal wrench`,
        `If the motor or internal components have failed, replacement is recommended`,
        `Mounting flange and seal leaks are checked and repaired`,
        `Drain connections are inspected and cleared if needed`,
        `The disposal is tested for proper operation, drainage, and no leaks`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Garbage Disposal Repairs in ${cityName}`,
      body: `Most garbage disposal repairs in ${cityName} are completed in a single visit:`,
      ordered: true,
      list: [
        `Diagnosis takes 15 to 30 minutes`,
        `Jam clearing and flywheel repair takes 20 to 40 minutes`,
        `Leak repair at the flange or drain connection takes 30 to 60 minutes`,
        `Full disposal replacement takes 1 to 2 hours including removal and installation`,
        `Electrical or wiring repair adds 30 to 60 minutes`,
        `Testing and cleanup add 10 to 15 minutes`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Garbage Disposal Repair in ${cityName}`,
      body: `Garbage disposal repair costs in ${cityName} depend on the problem and whether replacement is needed:`,
      list: [
        `Type of repair — jam clearing costs less than motor or seal replacement`,
        `Whether the disposal needs full replacement vs repair`,
        `Disposal horsepower and brand — higher-end units cost more to replace`,
        `Electrical work needed — new wiring, switch replacement, or GFCI installation`,
        `Plumbing modifications — drain or supply line adjustments for a new unit`,
        `Whether the sink flange needs resealing or replacement`,
        `Emergency or after-hours service timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Garbage Disposal Problems in ${cityName}`,
      body: `Most disposal problems in ${cityName} are preventable with proper use and maintenance. ${hardnessNote}`,
      list: [
        `Run cold water before, during, and after using the disposal to flush food waste`,
        `Avoid putting fibrous foods, grease, bones, or fruit pits in the disposal`,
        `Grind small amounts of food at a time rather than large batches`,
        `Clean the disposal monthly by grinding ice cubes and citrus peels`,
        `Do not use chemical drain cleaners in the disposal`,
        `Check the mounting flange periodically for signs of leaking`,
        `If the disposal is over 10 years old, consider proactive replacement before failure`,
        `Always turn off the power at the breaker before attempting any maintenance`,
      ],
    },
  ];
}

function waterSoftenerRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const hardnessNote = d.hardnessPpm > 175
    ? `With water hardness at ${d.hardnessPpm} mg/L from ${d.waterUtility}, your water softener works hard and needs regular maintenance.`
    : `Even at ${d.hardnessPpm} mg/L, a water softener helps protect fixtures and appliances from mineral buildup.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Water Softener Needs Repair in ${cityName}`,
      body: `Water softener problems in ${cityName} homes often go unnoticed until water quality changes. ${hardnessNote} Watch for:`,
      list: [
        `Soap does not lather well or feels different than usual`,
        `White spots or scale buildup reappearing on faucets and dishes`,
        `The unit regenerates too frequently or not at all`,
        `An error code or warning light on the control panel`,
        `Salty taste in the water`,
        `Low water pressure throughout the house`,
        `The brine tank is full of salt but the water is still hard`,
        `Water leaking from the unit or the bypass valve`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Water Softener Repair in ${cityName}`,
      body: `Call a plumber in ${cityName} when your water softener is not functioning properly:`,
      list: [
        `You notice scale buildup returning on fixtures or dishes`,
        `The unit displays an error code or warning light`,
        `Water pressure has dropped throughout the house`,
        `The system regenerates constantly or has stopped regenerating`,
        `Water has a salty taste`,
        `The brine tank has a salt bridge — a hard crust that prevents salt from dissolving`,
        `The unit is leaking or the bypass valve is not working`,
        `Your system is over 10 years old and showing multiple symptoms`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Water Softener Problem in ${cityName}`,
      body: `If your water softener is malfunctioning in ${cityName}:`,
      list: [
        `Switch the unit to bypass mode to stop softening while maintaining water supply`,
        `Check the control panel for error codes and note them`,
        `Check the brine tank for a salt bridge — do not reach in with your hands`,
        `If the unit is leaking, shut the water to the softener and use the bypass`,
        `Do not attempt to disassemble the control valve without proper training`,
        `Check the power supply — ensure the unit is plugged in and the outlet works`,
        `If water pressure is low, check the pre-filter if your system has one`,
        `Note the model and serial number for the plumber`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Water Softener Repairs You Should Not DIY in ${cityName}`,
      body: `Water softeners involve plumbing connections, electrical components, and pressurized resin tanks. In ${cityName}, do not attempt:`,
      list: [
        `Disassembling the control valve without understanding the internal components`,
        `Replacing the resin bed yourself — improper installation can damage the system`,
        `Modifying the bypass valve plumbing without shutting the water off`,
        `Adjusting the regeneration cycle without understanding the settings`,
        `Using the wrong type of salt — rock salt or potassium chloride may not be compatible`,
        `Ignoring a leaking unit — water damage to surrounding areas can be extensive`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Water Softener Repair in ${cityName}`,
      body: `A water softener repair visit in ${cityName} is structured to diagnose and resolve the issue efficiently:`,
      list: [
        `The plumber inspects the unit, control panel, and plumbing connections`,
        `The brine tank is checked for salt bridges, salt sludge, or low salt levels`,
        `The control valve is tested for proper regeneration cycling`,
        `The resin bed condition is assessed if the water is still hard despite salt`,
        `The bypass valve is tested for proper operation`,
        `The approved repair is performed — component replacement, resin replacement, or settings adjustment`,
        `The system is tested for proper softening and checked for leaks`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Water Softener Repairs in ${cityName}`,
      body: `Most water softener repairs in ${cityName} are completed in a single visit:`,
      ordered: true,
      list: [
        `Diagnosis and inspection takes 30 to 60 minutes`,
        `Control valve repair or replacement takes 1 to 2 hours`,
        `Resin bed replacement takes 2 to 4 hours depending on tank size`,
        `Brine tank cleaning and salt bridge removal takes 30 to 60 minutes`,
        `Bypass valve repair takes 30 to 60 minutes`,
        `Testing and regeneration cycle verification add 30 to 60 minutes`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Water Softener Repair in ${cityName}`,
      body: `Water softener repair costs in ${cityName} depend on the component and system type:`,
      list: [
        `Type of repair — a settings adjustment costs less than a control valve replacement`,
        `Whether the resin bed needs replacement — this is a larger job`,
        `System brand and model — proprietary parts may cost more`,
        `Whether the bypass valve or plumbing connections need repair`,
        `Whether the system needs full replacement vs repair`,
        `System age — units over 10-12 years may not be worth repairing`,
        `Emergency or after-hours service timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Water Softener Problems in ${cityName}`,
      body: `Most water softener failures in ${cityName} can be prevented with routine maintenance. ${hardnessNote}`,
      list: [
        `Check the salt level monthly and refill as needed — do not let the tank run empty`,
        `Use high-quality pellet salt — avoid rock salt which contains impurities`,
        `Break up salt bridges in the brine tank every few months`,
        `Clean the brine tank annually to remove salt sludge and sediment`,
        `Check the pre-filter monthly if your system has one and replace as needed`,
        `Schedule a professional inspection every 1 to 2 years`,
        `Verify the regeneration settings match your household water usage`,
        `If the system is over 10 years old, consider planning for replacement`,
      ],
    },
  ];
}

function wholeHouseRepipingBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const pipeNote = `Homes in ${cityName} built during the ${d.pipeEra} commonly have ${d.pipeMaterial}, which has a known service life and may need full replacement.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs You May Need Whole-House Repiping in ${cityName}`,
      body: `Repiping is a major project, but it becomes necessary when aging pipes fail repeatedly. ${pipeNote} Watch for:`,
      list: [
        `Frequent leaks at multiple locations throughout the home`,
        `Discolored or rusty water from taps, especially first thing in the morning`,
        `Low or inconsistent water pressure across multiple fixtures`,
        `Water stains on walls, ceilings, or floors appearing in different areas`,
        `A metallic taste or odor in the water`,
        `Visible corrosion, green patina, or mineral buildup on exposed pipes`,
        `Pinhole leaks recurring in copper pipes`,
        `Your home still has original pipes from the ${d.pipeEra} and has never been repiped`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Whole-House Repiping in ${cityName}`,
      body: `Call a licensed plumber in ${cityName} to discuss repiping when:`,
      list: [
        `You have had two or more pipe leaks in the past year`,
        `Water is discolored or has a metallic taste`,
        `Water pressure is consistently low throughout the house`,
        `Your home has ${d.pipeMaterial} from the ${d.pipeEra} and you are planning a renovation`,
        `You notice pinhole leaks in copper pipes — these indicate systemic corrosion`,
        `You are experiencing recurring slab leaks`,
        `An inspection has revealed extensive pipe corrosion or degradation`,
        `You want to upgrade to PEX or copper for long-term reliability`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps While Considering Repiping in ${cityName}`,
      body: `If you are experiencing recurring pipe problems in your ${cityName} home:`,
      list: [
        `Monitor for new leaks and address them immediately`,
        `Know where your main shutoff valve is and test it regularly`,
        `Check exposed pipes in the basement or crawl space for signs of corrosion`,
        `If a leak occurs, shut the nearest valve or the main shutoff`,
        `Take photos of any visible pipe damage for the plumber's assessment`,
        `Do not ignore small leaks — they indicate systemic pipe failure`,
        `Keep a record of leak locations and dates — this helps the plumber assess the scope`,
        `Consider a water meter test to check for hidden leaks`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Why Whole-House Repiping Is Not a DIY Project in ${cityName}`,
      body: `Repiping a home requires permits, specialized tools, and professional expertise. In ${cityName}:`,
      list: [
        `Repiping requires a plumbing permit in ${statePhrase}`,
        `Improper pipe sizing can cause pressure imbalances and fixture damage`,
        `Incorrect joining methods for PEX or copper can lead to hidden leaks`,
        `Working in wall cavities requires knowledge of electrical line locations`,
        `The main water line must be properly shut and reconnected`,
        `Post-repiping pressure testing and inspection are required by code`,
        `Improper repiping can reduce water pressure or cause cross-connections`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Whole-House Repiping Project in ${cityName}`,
      body: `A repiping project in ${cityName} is a multi-day process that follows a structured plan:`,
      list: [
        `The plumber assesses the home's layout, pipe runs, and access points`,
        `A written quote is provided with the pipe material recommendation (PEX or copper)`,
        `Permits are pulled and the project is scheduled`,
        `Water is shut off and the old pipes are removed or abandoned`,
        `New pipes are routed through walls, ceilings, and crawl spaces`,
        `Connections are made at all fixtures, the water heater, and the main line`,
        `The system is pressure-tested and inspected by the local authority`,
        `Walls and access points are documented for drywall restoration`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Whole-House Repiping in ${cityName}`,
      body: `Repiping timelines in ${cityName} depend on the home size and pipe accessibility:`,
      ordered: true,
      list: [
        `Assessment and quoting takes 1 to 2 hours on-site`,
        `Permit processing in ${statePhrase} takes 1 to 5 days`,
        `A typical 2-bathroom home repipe takes 2 to 4 days`,
        `Larger homes or complex layouts may take 5 to 7 days`,
        `Pressure testing and inspection add 1 day`,
        `Drywall patching and restoration typically takes 2 to 4 days after plumbing is complete`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Whole-House Repiping in ${cityName}`,
      body: `Repiping costs in ${cityName} depend on the home size, pipe material, and access conditions:`,
      list: [
        `Home size — number of bathrooms, fixtures, and total pipe length needed`,
        `Pipe material — PEX is generally less expensive than copper`,
        `Number of stories — multi-story homes require more labor and access work`,
        `Access difficulty — finished basements, cathedral ceilings, or tile walls add time`,
        `Whether the water heater connection needs to be upgraded`,
        `Permit and inspection requirements in ${statePhrase}`,
        `Drywall and finish restoration after the repipe is complete`,
        `Whether the yard or main line also needs replacement`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Maintaining New Pipes After Repiping in ${cityName}`,
      body: `After repiping your ${cityName} home, these steps will protect your investment:`,
      list: [
        `If you chose PEX, no special maintenance is needed — it is resistant to scale and corrosion`,
        `If you chose copper, monitor for pinhole leaks, especially if water is aggressive`,
        `Install a whole-house water filter to protect new pipes from sediment`,
        `Maintain water pressure below 80 psi — install a regulator if needed`,
        `If you have a water softener, keep it maintained to protect new pipes`,
        `Schedule a plumbing inspection 1 year after repiping to verify all connections`,
        `Keep documentation of the repipe for future home sale or insurance purposes`,
        `Address any small leaks immediately — even new systems can have a fitting issue`,
      ],
    },
  ];
}

function mainWaterShutoffValveRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const pipeNote = `In ${cityName} homes with ${d.pipeMaterial} from the ${d.pipeEra}, the main shutoff valve is often original and may be seized or corroded.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Main Shutoff Valve Needs Repair in ${cityName}`,
      body: `The main shutoff valve is the most important valve in your home. ${pipeNote} Watch for:`,
      list: [
        `The valve handle is difficult to turn or will not move at all`,
        `Water continues to flow when the valve is in the closed position`,
        `Visible corrosion or mineral buildup on the valve body`,
        `Water is leaking from the valve stem or packing nut`,
        `The handle is loose or broken off`,
        `The valve is a gate valve that has not been operated in years`,
        `You cannot locate the main shutoff valve at all`,
        `The valve is buried or inaccessible behind finished walls`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Shutoff Valve Repair in ${cityName}`,
      body: `Call a plumber in ${cityName} when the main shutoff valve is not functioning properly:`,
      list: [
        `The valve will not turn or is extremely difficult to operate`,
        `Water continues to flow when the valve is closed`,
        `The valve is leaking from the stem or body`,
        `The handle is broken or missing`,
        `You are planning a renovation and need a reliable shutoff`,
        `You have never tested the valve and want to ensure it works in an emergency`,
        `The valve is an old gate valve and you want to upgrade to a ball valve`,
        `You cannot find the main shutoff and need help locating it`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps if Your Shutoff Valve Fails in ${cityName}`,
      body: `If you need to shut water off in an emergency and the main valve is not working in your ${cityName} home:`,
      list: [
        `Try the street-side shutoff at the water meter — you may need a meter key`,
        `If you cannot shut the water at the meter, call the water utility emergency line`,
        `Use fixture-level shutoffs at toilets, sinks, and the water heater if the problem is localized`,
        `If water is flooding the home, turn off electricity to affected areas`,
        `Place towels and buckets to contain water as much as possible`,
        `Call a plumber immediately — a failed shutoff valve is an urgent situation`,
        `Do not force a seized valve — it can break and cause a worse leak`,
        `Take photos of the valve and any damage for insurance`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Shutoff Valve Repairs You Should Not DIY in ${cityName}`,
      body: `Main shutoff valve repair involves the main water line and requires proper tools and coordination. In ${cityName}:`,
      list: [
        `Replacing the main shutoff valve without turning off the water at the street`,
        `Using a pipe wrench on a corroded valve — it can break the pipe or valve body`,
        `Attempting to repack a leaking valve stem without proper packing material`,
        `Replacing a gate valve with a ball valve without proper pipe preparation`,
        `Working on the street-side shutoff without the utility company's involvement`,
        `Ignoring a leaking valve — it can fail completely during an emergency`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Shutoff Valve Repair in ${cityName}`,
      body: `A shutoff valve repair in ${cityName} is a focused procedure that requires controlling the water supply:`,
      list: [
        `The plumber locates and shuts the water at the street meter or the nearest upstream valve`,
        `The old valve is assessed — it may be repairable or need full replacement`,
        `If the valve stem is leaking, the packing nut may be tightened or repacked`,
        `If the valve is seized or broken, it is cut out and replaced with a ball valve`,
        `The new valve is installed with proper fittings for ${d.pipeMaterial}`,
        `The water is slowly turned back on and the valve is tested for proper operation`,
        `The plumber verifies there are no leaks at the new valve or connections`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Shutoff Valve Repair in ${cityName}`,
      body: `Most shutoff valve repairs in ${cityName} are completed in a single visit:`,
      ordered: true,
      list: [
        `Locating and shutting the upstream water supply takes 15 to 30 minutes`,
        `Diagnosis of the valve condition takes 15 to 30 minutes`,
        `Stem repacking or handle replacement takes 30 to 45 minutes`,
        `Full valve replacement takes 1 to 2 hours depending on pipe access`,
        `Testing and verification take 15 to 30 minutes`,
        `Same-day service is typical for most shutoff valve repairs`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Shutoff Valve Repair in ${cityName}`,
      body: `Shutoff valve repair costs in ${cityName} depend on the valve type, access, and pipe condition:`,
      list: [
        `Type of repair — repacking a stem costs less than full valve replacement`,
        `Valve type — upgrading from a gate valve to a ball valve costs more but is more reliable`,
        `Pipe material and condition — corroded ${d.pipeMaterial} may need section replacement`,
        `Access — valves in tight spaces or behind finished walls add labor time`,
        `Whether the street-side shutoff is accessible and functional`,
        `Whether the water utility needs to be involved for the street-side shutoff`,
        `Emergency or after-hours service timing`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Maintaining Your Main Shutoff Valve in ${cityName}`,
      body: `A functioning shutoff valve is critical in an emergency. In ${cityName} homes:`,
      list: [
        `Test the main shutoff valve once a year — turn it fully closed and then fully open`,
        `If the valve is stiff, do not force it — call a plumber to service it`,
        `Know the exact location of the valve and ensure it is accessible`,
        `If you have a gate valve, consider upgrading to a ball valve for reliability`,
        `Keep a meter key accessible in case you need to shut water at the street`,
        `Check for signs of corrosion or mineral buildup on the valve body`,
        `Make sure all household members know where the shutoff is and how to use it`,
        `If the valve is behind a finished wall, install an access panel for future maintenance`,
      ],
    },
  ];
}

function sumpPumpRepairBlocks(cityName, stateCode, d) {
  const statePhrase = stateCode || 'your state';
  const riskNote = d.winterRisk === 'high'
    ? `${cityName} experiences heavy precipitation and winter freeze-thaw cycles that stress sump pump systems.`
    : `Storm patterns and groundwater levels in ${cityName} can still create sump pump demand year-round.`;

  return [
    {
      type: 'warning-signs',
      heading: `Warning Signs Your Sump Pump Needs Repair in ${cityName}`,
      body: `Sump pump failures in ${cityName} often happen during storms when you need the pump most. ${riskNote} Watch for:`,
      list: [
        `The pump runs continuously without stopping`,
        `Strange noises such as grinding, rattling, or humming during operation`,
        `The pump does not turn on when water rises in the pit`,
        `Visible rust or corrosion on the pump or discharge pipe`,
        `Water in the basement or crawl space that was not there before`,
        `The pump cycles on and off rapidly — short cycling`,
        `The discharge line is frozen, clogged, or not flowing`,
        `The float switch is stuck or not moving freely`,
      ],
    },
    {
      type: 'when-to-call',
      heading: `When to Call for Sump Pump Repair in ${cityName}`,
      body: `Call a plumber in ${cityName} when your sump pump shows signs of failure:`,
      list: [
        `The pump does not activate when water rises in the pit`,
        `The pump runs continuously without shutting off`,
        `You hear unusual noises during pump operation`,
        `Water has entered the basement or crawl space`,
        `The float switch is stuck or the pump is short cycling`,
        `The discharge line is clogged, frozen, or not draining properly`,
        `The pump is over 7 years old and has not been serviced recently`,
        `You want to install a battery backup system before the next storm season`,
      ],
    },
    {
      type: 'immediate-safety',
      heading: `Immediate Steps for a Sump Pump Failure in ${cityName}`,
      body: `If your sump pump fails during a storm in ${cityName}, take these steps:`,
      list: [
        `Do not enter standing water if electrical outlets or appliances may be submerged`,
        `Turn off electricity to the flooded area at the breaker if it is safe to reach`,
        `Check if the float switch is stuck — sometimes gently nudging it can restart the pump`,
        `Check the breaker — the pump may have tripped the circuit`,
        `If you have a backup pump, switch to it immediately`,
        `Use a wet vacuum or buckets to remove water if the pump is not working`,
        `Move valuables and furniture to higher ground`,
        `Call a plumber immediately — sump pump failures can lead to rapid flooding`,
      ],
    },
    {
      type: 'diy-unsafe',
      heading: `Sump Pump Repairs You Should Not DIY in ${cityName}`,
      body: `Sump pumps involve electricity, water, and sometimes battery systems. In ${cityName} homes, do not attempt:`,
      list: [
        `Working on the pump while it is plugged in and standing water is present`,
        `Replacing the pump motor or electrical components without proper training`,
        `Installing a battery backup system without proper electrical knowledge`,
        `Modifying the discharge line without ensuring proper drainage away from the foundation`,
        `Using an extension cord to power the pump — it should be on a dedicated circuit`,
        `Ignoring a failing pump during storm season — flooding can cause extensive damage`,
      ],
    },
    {
      type: 'repair-process',
      heading: `What Happens During a Sump Pump Repair in ${cityName}`,
      body: `A sump pump repair visit in ${cityName} is structured to diagnose and fix the issue quickly:`,
      list: [
        `The plumber inspects the pump, float switch, discharge line, and check valve`,
        `The pit is checked for debris that may be interfering with the float`,
        `The electrical connection and breaker are tested`,
        `If the pump motor has failed, replacement is recommended`,
        `If the float switch is stuck or failed, it is repaired or replaced`,
        `The discharge line is inspected for clogs, freezing, or improper routing`,
        `The pump is tested by filling the pit and confirming proper activation and drainage`,
      ],
    },
    {
      type: 'repair-timeline',
      heading: `Typical Timeline for Sump Pump Repairs in ${cityName}`,
      body: `Most sump pump repairs in ${cityName} are completed in a single visit:`,
      ordered: true,
      list: [
        `Diagnosis and inspection takes 30 to 60 minutes`,
        `Float switch repair or replacement takes 30 to 60 minutes`,
        `Check valve replacement takes 30 to 45 minutes`,
        `Discharge line clearing takes 30 to 90 minutes depending on the blockage`,
        `Full pump replacement takes 1 to 3 hours including removal and installation`,
        `Battery backup installation takes 2 to 4 hours`,
      ],
    },
    {
      type: 'cost-factors',
      heading: `What Affects the Cost of Sump Pump Repair in ${cityName}`,
      body: `Sump pump repair costs in ${cityName} depend on the problem and whether replacement is needed:`,
      list: [
        `Type of repair — a float switch replacement costs less than a full pump replacement`,
        `Pump type — pedestal, submersible, or battery backup systems have different costs`,
        `Pump horsepower and brand — higher-capacity pumps cost more`,
        `Whether the discharge line needs repair or rerouting`,
        `Whether a battery backup system needs installation or battery replacement`,
        `Whether the pit or basin needs cleaning or enlargement`,
        `Electrical work — a dedicated circuit or GFCI may be needed`,
        `Emergency or after-hours service timing, especially during storms`,
      ],
    },
    {
      type: 'preventive-maintenance',
      heading: `Preventing Sump Pump Failures in ${cityName}`,
      body: `Sump pump maintenance is critical in ${cityName} where storm flooding can occur. ${riskNote}`,
      list: [
        `Test the pump quarterly by pouring water into the pit and confirming it activates`,
        `Clean the sump pit annually to remove debris, dirt, and sediment`,
        `Inspect the float switch for free movement and replace if sticking`,
        `Check the discharge line for clogs, especially before storm season`,
        `Install a battery backup system if you do not have one — power outages often coincide with storms`,
        `Replace the backup battery every 3 to 5 years`,
        `Consider a water-powered backup pump as a secondary failsafe`,
        `If the pump is over 7 years old, consider proactive replacement before failure`,
      ],
    },
  ];
}

export function getServiceBlocks(serviceSlug, cityName, stateCode, d) {
  if (serviceSlug === 'emergency') return emergencyBlocks(cityName, stateCode, d);
  if (serviceSlug === 'water-heater-repair') return waterHeaterBlocks(cityName, stateCode, d);
  if (serviceSlug === 'leak-repair') return leakRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'drain-cleaning') return drainCleaningBlocks(cityName, stateCode, d);
  if (serviceSlug === 'pipe-burst-repair') return pipeBurstBlocks(cityName, stateCode, d);
  if (serviceSlug === 'sewer-line-repair') return sewerLineRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'toilet-repair') return toiletRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'slab-leak-repair') return slabLeakRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'water-line-repair') return waterLineRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'faucet-repair') return faucetRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'garbage-disposal-repair') return garbageDisposalRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'water-softener-repair') return waterSoftenerRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'whole-house-repiping') return wholeHouseRepipingBlocks(cityName, stateCode, d);
  if (serviceSlug === 'main-water-shutoff-valve-repair') return mainWaterShutoffValveRepairBlocks(cityName, stateCode, d);
  if (serviceSlug === 'sump-pump-repair') return sumpPumpRepairBlocks(cityName, stateCode, d);
  return null;
}
