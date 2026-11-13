// All the built-in quiz questions live here (100 in each of 4 categories).
// answer = the position (0, 1, 2 or 3) of the correct option.
// Questions that players add in the editor are saved in Firebase, not here.
const questions = [
  // ----- Science -----
  {
    category: "Science",
    difficulty: "easy",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Saturn", "Mars", "Jupiter"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which organ pumps blood around the body?",
    options: ["The heart", "The brain", "The lungs", "The stomach"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What process do plants use to make food from sunlight?",
    options: ["Respiration", "Evaporation", "Photosynthesis", "Digestion"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What do we call water when it freezes?",
    options: ["Steam", "Fog", "Ice", "Dew"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "How many legs does an insect have?",
    options: ["4", "8", "6", "10"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which gas do humans need to breathe in to stay alive?",
    options: ["Oxygen", "Hydrogen", "Helium", "Nitrogen"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which star is closest to Earth?",
    options: ["Sirius", "Betelgeuse", "Polaris", "The Sun"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which group of animals do frogs belong to?",
    options: ["Mammals", "Amphibians", "Birds", "Reptiles"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which force pulls objects towards the Earth?",
    options: ["Magnetism", "Gravity", "Friction", "Static electricity"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What do we call animals that eat only plants?",
    options: ["Omnivores", "Carnivores", "Herbivores", "Predators"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which part of the body do we use to see?",
    options: ["The ears", "The eyes", "The tongue", "The nose"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which part of the body do we use to hear?",
    options: ["The ears", "The nose", "The eyes", "The skin"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "About how many days does Earth take to travel once around the Sun?",
    options: ["About 100", "About 365", "About 30", "About 7"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What is the name of our galaxy?",
    options: ["The Milky Way", "The Sombrero", "The Whirlpool", "Andromeda"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which part of a plant takes in water from the soil?",
    options: ["The roots", "The leaves", "The flowers", "The fruit"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which kind of animal is a whale?",
    options: ["A reptile", "An amphibian", "A fish", "A mammal"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which insect makes honey?",
    options: ["The bee", "The fly", "The beetle", "The ant"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which is the biggest planet in our solar system?",
    options: ["Earth", "Saturn", "Neptune", "Jupiter"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "At sea level, at what temperature (in degrees Celsius) does water boil?",
    options: ["120", "100", "90", "80"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which natural object orbits the Earth?",
    options: ["The Sun", "Venus", "The Moon", "Mars"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What is the layer of gases around the Earth called?",
    options: ["The core", "The mantle", "The atmosphere", "The crust"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which of these gives off its own light?",
    options: ["A planet", "The Moon", "The Sun", "A mirror"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which sense do we use our nose for?",
    options: ["Smell", "Hearing", "Sight", "Taste"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which is the largest land animal?",
    options: ["The rhinoceros", "The giraffe", "The African elephant", "The hippopotamus"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which gas makes fizzy drinks bubble?",
    options: ["Nitrogen", "Oxygen", "Helium", "Carbon dioxide"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What do we call water turning into vapour?",
    options: ["Condensation", "Melting", "Freezing", "Evaporation"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which planet is third from the Sun?",
    options: ["Earth", "Venus", "Mercury", "Mars"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What does a caterpillar grow into?",
    options: ["A bee", "An ant", "A beetle", "A butterfly or moth"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What is the study of living things called?",
    options: ["Chemistry", "Biology", "Astronomy", "Geology"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which of these is a solid at room temperature?",
    options: ["Milk", "Air", "Iron", "Juice"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which is the fastest land animal?",
    options: ["The cheetah", "The leopard", "The lion", "The horse"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "In which direction does the Sun rise?",
    options: ["North", "West", "East", "South"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "What is the centre of an atom called?",
    options: ["The membrane", "The nucleus", "The shell", "The orbit"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which part of the human body protects the brain?",
    options: ["The ribs", "The spine", "The pelvis", "The skull"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which gas do plants take in from the air?",
    options: ["Hydrogen", "Oxygen", "Nitrogen", "Carbon dioxide"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which blood cells carry oxygen around the body?",
    options: ["Plasma", "White blood cells", "Red blood cells", "Platelets"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the chemical formula of water?",
    options: ["H2O", "CO2", "HO2", "O2"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which planet is famous for its bright rings?",
    options: ["Mercury", "Earth", "Saturn", "Mars"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Ag", "Au", "Gd"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which part of the cell is called its powerhouse?",
    options: ["The vacuole", "The ribosome", "The mitochondrion", "The nucleus"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "About how many bones does an adult human have?",
    options: ["206", "306", "406", "106"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which vitamin does our skin make using sunlight?",
    options: ["Vitamin C", "Vitamin A", "Vitamin D", "Vitamin K"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the hardest natural substance?",
    options: ["Iron", "Gold", "Quartz", "Diamond"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the SI unit of electric current?",
    options: ["The volt", "The watt", "The ampere", "The ohm"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What kind of energy does a moving car have?",
    options: ["Potential energy", "Kinetic energy", "Solar energy", "Nuclear energy"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which gas makes up most of Earth's atmosphere?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What do we call a scientist who studies rocks?",
    options: ["A geologist", "A zoologist", "A biologist", "A botanist"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the name for plants losing water vapour through their leaves?",
    options: ["Germination", "Transpiration", "Pollination", "Fermentation"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which organs filter the blood and make urine?",
    options: ["The liver", "The heart", "The kidneys", "The lungs"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the pH of pure water?",
    options: ["7", "10", "1", "14"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the chemical symbol for sodium?",
    options: ["So", "Sd", "Na", "S"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which type of rock forms from cooled lava?",
    options: ["Sedimentary", "Igneous", "Fossil", "Metamorphic"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Mars", "Earth", "Mercury"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What do we call animals that eat both plants and meat?",
    options: ["Decomposers", "Herbivores", "Omnivores", "Carnivores"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which gas is the main ingredient of the Sun?",
    options: ["Hydrogen", "Carbon dioxide", "Oxygen", "Nitrogen"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which coloured part of the eye controls the size of the pupil?",
    options: ["The lens", "The retina", "The cornea", "The iris"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What do we call a material that lets electricity flow through easily?",
    options: ["An insulator", "A conductor", "A fuse", "A resistor"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the largest organ of the human body?",
    options: ["The liver", "The skin", "The brain", "The heart"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "How many chambers does the human heart have?",
    options: ["3", "6", "4", "2"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which scientist is famous for the laws of motion and gravity?",
    options: ["Marie Curie", "Isaac Newton", "Thomas Edison", "Charles Darwin"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the main job of white blood cells?",
    options: ["Carrying food", "Fighting infection", "Making bones", "Carrying oxygen"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What are animals without backbones called?",
    options: ["Amphibians", "Invertebrates", "Mammals", "Vertebrates"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the chemical symbol for iron?",
    options: ["Ir", "I", "In", "Fe"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which planet is often called Earth's twin because of its similar size?",
    options: ["Mercury", "Venus", "Mars", "Neptune"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What kind of energy do plants store in the food they make?",
    options: ["Chemical energy", "Sound energy", "Nuclear energy", "Magnetic energy"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What is the name of the process when solid ice turns into liquid water?",
    options: ["Freezing", "Melting", "Evaporation", "Condensation"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "Which part of the brain controls balance and coordination?",
    options: ["The spinal cord", "The cerebrum", "The cerebellum", "The brain stem"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the SI unit of force?",
    options: ["The pascal", "The joule", "The newton", "The watt"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "About how long does sunlight take to reach Earth?",
    options: ["About 8 seconds", "About 8 days", "About 8 minutes", "About 8 hours"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the chemical formula of table salt?",
    options: ["KCl", "CaCO3", "NaOH", "NaCl"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which particle in an atom has a negative charge?",
    options: ["The nucleus", "The proton", "The neutron", "The electron"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the SI unit of electrical resistance?",
    options: ["The watt", "The ohm", "The volt", "The ampere"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the atomic number of carbon?",
    options: ["8", "6", "12", "14"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which part of a plant cell carries out photosynthesis?",
    options: ["The chloroplast", "The mitochondrion", "The nucleus", "The Golgi body"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Who proposed the theory of evolution by natural selection?",
    options: ["Louis Pasteur", "Gregor Mendel", "Charles Darwin", "Isaac Newton"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which is the lightest chemical element?",
    options: ["Helium", "Hydrogen", "Lithium", "Oxygen"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What do we call the study of earthquakes?",
    options: ["Meteorology", "Ecology", "Cartography", "Seismology"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which process moves water through a membrane from a weaker solution to a stronger one?",
    options: ["Osmosis", "Respiration", "Digestion", "Evaporation"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which blood group is called the universal donor for red blood cells?",
    options: ["A positive", "AB positive", "B negative", "O negative"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What do we call a substance that speeds up a reaction without being used up?",
    options: ["A reactant", "A solvent", "A precipitate", "A catalyst"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the chemical symbol for potassium?",
    options: ["K", "Po", "Pt", "P"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "How many chromosomes are in a normal human body cell?",
    options: ["44", "46", "48", "23"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which layer of the Earth lies between the crust and the core?",
    options: ["The troposphere", "The stratosphere", "The ionosphere", "The mantle"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the acceleration due to gravity on Earth, approximately?",
    options: ["9.8 m/s²", "3.7 m/s²", "24.8 m/s²", "1.6 m/s²"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which type of lens is used to correct short-sightedness?",
    options: ["A flat lens", "A prism", "A convex lens", "A concave lens"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which planet spins fastest, giving it the shortest day of these four?",
    options: ["Mars", "Earth", "Jupiter", "Mercury"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What does DNA stand for?",
    options: ["Deoxyribose nitrate acid", "Dynamic nucleic acid", "Dioxynucleic acid", "Deoxyribonucleic acid"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the SI unit of energy?",
    options: ["The pascal", "The newton", "The watt", "The joule"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which gas is released when zinc reacts with hydrochloric acid?",
    options: ["Carbon dioxide", "Chlorine", "Oxygen", "Hydrogen"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the point underground where an earthquake starts called?",
    options: ["The focus", "The epicentre", "The fault line", "The crater"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Where is most of a cell's DNA stored?",
    options: ["In the cytoplasm", "In the ribosome", "In the nucleus", "In the cell wall"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What do we call animals that are active at night?",
    options: ["Nocturnal", "Migratory", "Diurnal", "Dormant"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which type of chemical bond involves sharing electrons?",
    options: ["A metallic bond", "An ionic bond", "A magnetic bond", "A covalent bond"],
    answer: 3
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which planet has a giant storm called the Great Red Spot?",
    options: ["Mars", "Saturn", "Jupiter", "Neptune"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which element has the chemical symbol W?",
    options: ["Titanium", "Tungsten", "Tantalum", "Tin"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What do we call the amount of matter in an object?",
    options: ["Density", "Weight", "Mass", "Volume"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "How do bacteria usually reproduce?",
    options: ["By pollination", "By splitting in two", "By making seeds", "By laying eggs"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which scale was commonly used to measure earthquake magnitude?",
    options: ["The Richter scale", "The Kelvin scale", "The Beaufort scale", "The Mohs scale"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What do we call the splitting of white light into its colours?",
    options: ["Dispersion", "Absorption", "Reflection", "Diffusion"],
    answer: 0
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "Which particle in an atom has no electric charge?",
    options: ["The neutron", "The electron", "The proton", "The ion"],
    answer: 0
  },

  // ----- Geography -----
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of Nigeria?",
    options: ["Lagos", "Abuja", "Kano", "Ibadan"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the largest ocean on Earth?",
    options: ["The Indian Ocean", "The Arctic Ocean", "The Atlantic Ocean", "The Pacific Ocean"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "On which continent is Nigeria?",
    options: ["Asia", "South America", "Europe", "Africa"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the largest continent?",
    options: ["North America", "Asia", "Africa", "Europe"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "How many continents are there?",
    options: ["5", "6", "8", "7"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which country is nicknamed the Giant of Africa?",
    options: ["Kenya", "Egypt", "South Africa", "Nigeria"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the largest country in the world by area?",
    options: ["China", "The United States", "Canada", "Russia"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of Ghana?",
    options: ["Accra", "Takoradi", "Kumasi", "Tamale"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of Egypt?",
    options: ["Luxor", "Alexandria", "Cairo", "Giza"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of Kenya?",
    options: ["Nakuru", "Mombasa", "Nairobi", "Kisumu"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which large desert covers much of North Africa?",
    options: ["The Kalahari", "The Sahara", "The Arabian Desert", "The Gobi"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of France?",
    options: ["Lyon", "Paris", "Marseille", "Nice"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of the United Kingdom?",
    options: ["Manchester", "Edinburgh", "Cardiff", "London"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of Japan?",
    options: ["Tokyo", "Seoul", "Osaka", "Kyoto"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which ocean lies to the west of Africa?",
    options: ["The Atlantic Ocean", "The Pacific Ocean", "The Indian Ocean", "The Arctic Ocean"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which imaginary line divides Earth into the Northern and Southern Hemispheres?",
    options: ["The Tropic of Cancer", "The Prime Meridian", "The Arctic Circle", "The Equator"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the tallest mountain above sea level?",
    options: ["Mount Everest", "K2", "Mount Kilimanjaro", "Mont Blanc"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the highest mountain in Africa?",
    options: ["Table Mountain", "Mount Kilimanjaro", "Mount Cameroon", "Mount Kenya"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which sea lies between Europe and Africa?",
    options: ["The Caspian Sea", "The Red Sea", "The Black Sea", "The Mediterranean Sea"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of the United States?",
    options: ["Chicago", "Washington, D.C.", "Los Angeles", "New York"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which city was Nigeria's capital before Abuja?",
    options: ["Kaduna", "Ibadan", "Port Harcourt", "Lagos"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the smallest ocean?",
    options: ["The Atlantic Ocean", "The Indian Ocean", "The Arctic Ocean", "The Pacific Ocean"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which country is home to the Eiffel Tower?",
    options: ["France", "Italy", "Germany", "Spain"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which country is home to the pyramids of Giza?",
    options: ["Egypt", "Sudan", "Libya", "Morocco"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which European country is shaped like a boot?",
    options: ["Spain", "Greece", "Portugal", "Italy"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "In which direction does the Sun set?",
    options: ["West", "North", "South", "East"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which country is home to kangaroos?",
    options: ["Australia", "South Africa", "Brazil", "New Zealand"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which direction is opposite to north?",
    options: ["East", "West", "Northwest", "South"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What do we call a piece of land completely surrounded by water?",
    options: ["A valley", "A peninsula", "A plateau", "An island"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "What do we call a large area of very dry land with little rain?",
    options: ["A delta", "A desert", "A rainforest", "A glacier"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which river flows through Cairo?",
    options: ["The Nile", "The Zambezi", "The Congo", "The Niger"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "On which continent is Egypt mostly located?",
    options: ["South America", "Asia", "Europe", "Africa"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which country has the largest population in Africa?",
    options: ["Egypt", "Nigeria", "Ethiopia", "South Africa"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which country is the city of Rio de Janeiro in?",
    options: ["Brazil", "Peru", "Chile", "Argentina"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the longest river in Africa?",
    options: ["The Zambezi", "The Niger", "The Congo", "The Nile"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Brazil?",
    options: ["Rio de Janeiro", "Salvador", "Brasília", "São Paulo"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Canada?",
    options: ["Vancouver", "Toronto", "Ottawa", "Montreal"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Australia?",
    options: ["Perth", "Melbourne", "Sydney", "Canberra"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the largest lake in Africa?",
    options: ["Lake Tanganyika", "Lake Malawi", "Lake Chad", "Lake Victoria"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Ethiopia?",
    options: ["Khartoum", "Addis Ababa", "Kampala", "Nairobi"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which river meets the Benue at Lokoja in Nigeria?",
    options: ["The Ogun", "The Kaduna", "The Cross River", "The Niger"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the biggest island in the world that is not a continent?",
    options: ["Greenland", "Madagascar", "New Guinea", "Borneo"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the longest river in South America?",
    options: ["The Madeira", "The Orinoco", "The Amazon", "The Paraná"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which mountain range separates Europe from Asia in Russia?",
    options: ["The Andes", "The Ural Mountains", "The Himalayas", "The Alps"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Senegal?",
    options: ["Abidjan", "Conakry", "Dakar", "Bamako"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Cameroon?",
    options: ["Douala", "Garoua", "Bamenda", "Yaoundé"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "In which country is the city of Timbuktu?",
    options: ["Chad", "Mauritania", "Mali", "Niger"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which strait separates Spain from Morocco?",
    options: ["The Suez Canal", "The Strait of Hormuz", "The Strait of Gibraltar", "The Bosphorus"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which canal joins the Mediterranean Sea to the Red Sea?",
    options: ["The Erie Canal", "The Suez Canal", "The Panama Canal", "The Kiel Canal"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the largest country in Africa by area?",
    options: ["Algeria", "Sudan", "Egypt", "Nigeria"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["Japan", "South Korea", "China", "Thailand"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Spain?",
    options: ["Valencia", "Seville", "Barcelona", "Madrid"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Between which two continents does the Suez Canal region lie?",
    options: ["Asia and Australia", "Africa and Asia", "Europe and Asia", "Africa and Europe"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the longest mountain range on land?",
    options: ["The Himalayas", "The Alps", "The Andes", "The Rockies"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Italy?",
    options: ["Milan", "Rome", "Venice", "Naples"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Germany?",
    options: ["Berlin", "Frankfurt", "Hamburg", "Munich"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which African country has the capital city Lusaka?",
    options: ["Zambia", "Zimbabwe", "Botswana", "Malawi"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which country was formerly called the Gold Coast?",
    options: ["Ghana", "Sierra Leone", "Liberia", "Togo"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which continent is the coldest?",
    options: ["Asia", "Europe", "North America", "Antarctica"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Morocco?",
    options: ["Fez", "Casablanca", "Rabat", "Marrakesh"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the largest country in South America?",
    options: ["Argentina", "Brazil", "Colombia", "Peru"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which river flows through London?",
    options: ["The River Thames", "The River Rhine", "The River Seine", "The River Danube"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "In which country is Mount Kilimanjaro?",
    options: ["Uganda", "Tanzania", "Kenya", "Ethiopia"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Togo?",
    options: ["Accra", "Lomé", "Ouagadougou", "Cotonou"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which country lies directly west of Nigeria?",
    options: ["Cameroon", "Benin", "Togo", "Ghana"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which country lies directly east of Nigeria?",
    options: ["Chad", "Niger", "Benin", "Cameroon"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which is the largest desert in Africa?",
    options: ["The Kalahari", "The Namib", "The Sahara", "The Nubian Desert"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the smallest country in the world by area?",
    options: ["Vatican City", "Monaco", "San Marino", "Malta"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the largest hot desert in the world?",
    options: ["The Arabian Desert", "The Kalahari", "The Gobi", "The Sahara"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Tanzania?",
    options: ["Mwanza", "Dar es Salaam", "Dodoma", "Arusha"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Kazakhstan?",
    options: ["Almaty", "Astana", "Tashkent", "Bishkek"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the deepest lake in the world?",
    options: ["Lake Victoria", "Lake Tanganyika", "Lake Superior", "Lake Baikal"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Myanmar?",
    options: ["Naypyidaw", "Mandalay", "Bangkok", "Yangon"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the highest waterfall in the world?",
    options: ["Niagara Falls", "Victoria Falls", "Angel Falls", "Iguazu Falls"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which African country was never colonised by a European power, apart from a brief occupation?",
    options: ["Kenya", "Ghana", "Nigeria", "Ethiopia"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the longest river in Asia?",
    options: ["The Yangtze", "The Ganges", "The Mekong", "The Indus"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which sea has no coastline because it is bordered by ocean currents?",
    options: ["The Baltic Sea", "The Black Sea", "The Sargasso Sea", "The Red Sea"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which line of longitude is 0 degrees?",
    options: ["The Prime Meridian", "The Equator", "The Tropic of Capricorn", "The International Date Line"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Switzerland?",
    options: ["Basel", "Bern", "Zurich", "Geneva"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which strait separates Asia from North America?",
    options: ["The Strait of Gibraltar", "The Davis Strait", "The Bering Strait", "The Strait of Malacca"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the lowest point on Earth's land surface?",
    options: ["The shore of the Caspian Sea", "Death Valley", "Lake Chad", "The shore of the Dead Sea"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which country is made up of more than 17,000 islands?",
    options: ["The Philippines", "Indonesia", "Japan", "Malaysia"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the largest desert in the world, counting cold deserts?",
    options: ["The Sahara", "The Gobi", "Antarctica", "The Arabian Desert"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of New Zealand?",
    options: ["Auckland", "Christchurch", "Hamilton", "Wellington"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which river flows through the city of Baghdad?",
    options: ["The Nile", "The Tigris", "The Jordan", "The Euphrates"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which lake is shared by Nigeria, Niger, Chad and Cameroon?",
    options: ["Lake Volta", "Lake Kainji", "Lake Chad", "Lake Victoria"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the longest river in Nigeria?",
    options: ["The Kaduna", "The Benue", "The Niger", "The Cross River"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Turkey?",
    options: ["Bursa", "Izmir", "Istanbul", "Ankara"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Pakistan?",
    options: ["Islamabad", "Karachi", "Lahore", "Peshawar"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the highest mountain in South America?",
    options: ["Huascarán", "Aconcagua", "Chimborazo", "Cotopaxi"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which country is partly in Europe and partly in Asia and contains Istanbul?",
    options: ["Bulgaria", "Greece", "Turkey", "Iran"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Zimbabwe?",
    options: ["Lusaka", "Maputo", "Bulawayo", "Harare"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "In which country would you find Table Mountain?",
    options: ["South Africa", "Namibia", "Kenya", "Zimbabwe"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which of these West African countries is the largest by area?",
    options: ["Ghana", "Niger", "Nigeria", "Senegal"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which ocean contains the Mariana Trench, the deepest known part of the sea?",
    options: ["The Pacific Ocean", "The Atlantic Ocean", "The Indian Ocean", "The Arctic Ocean"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the political capital of Ivory Coast?",
    options: ["Yamoussoukro", "Bouaké", "San-Pédro", "Abidjan"],
    answer: 0
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "In which country is the Great Barrier Reef?",
    options: ["Mexico", "Australia", "The Philippines", "Indonesia"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Into which sea does the River Nile flow?",
    options: ["The Arabian Sea", "The Black Sea", "The Red Sea", "The Mediterranean Sea"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "What is the capital city of Rwanda?",
    options: ["Nairobi", "Kigali", "Kampala", "Bujumbura"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which African country is completely surrounded by South Africa?",
    options: ["Eswatini", "Namibia", "Lesotho", "Botswana"],
    answer: 2
  },

  // ----- Maths -----
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 7 x 8?",
    options: ["56", "63", "48", "54"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 100 divided by 4?",
    options: ["50", "30", "20", "25"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 9 + 6?",
    options: ["14", "16", "13", "15"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 15 - 7?",
    options: ["7", "8", "9", "6"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 6 x 6?",
    options: ["42", "36", "32", "30"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many sides does a triangle have?",
    options: ["4", "5", "3", "6"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many sides does a hexagon have?",
    options: ["6", "8", "5", "7"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is half of 50?",
    options: ["30", "20", "25", "15"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 12 x 3?",
    options: ["32", "36", "38", "34"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 81 divided by 9?",
    options: ["7", "9", "8", "6"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many minutes are in one hour?",
    options: ["100", "60", "24", "30"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many degrees are in a right angle?",
    options: ["180", "90", "60", "45"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 5 x 5?",
    options: ["10", "20", "30", "25"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 20 + 35?",
    options: ["65", "50", "55", "45"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 1000 - 1?",
    options: ["1001", "900", "999", "990"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "Which of these numbers is even?",
    options: ["18", "13", "7", "25"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is the next number: 2, 4, 6, 8, ...?",
    options: ["11", "9", "10", "12"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many days are in a week?",
    options: ["5", "8", "7", "6"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 4 x 9?",
    options: ["36", "40", "45", "32"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 10 x 10?",
    options: ["110", "10", "100", "1000"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many sides does a square have?",
    options: ["5", "6", "4", "3"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 49 divided by 7?",
    options: ["9", "7", "8", "6"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 30 - 12?",
    options: ["18", "22", "16", "20"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is a quarter of 100?",
    options: ["20", "10", "50", "25"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "Which is the largest number?",
    options: ["1,205", "1,052", "1,025", "1,250"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "How many months are in a year?",
    options: ["13", "12", "11", "10"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 3 x 7?",
    options: ["18", "21", "27", "24"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 11 + 12?",
    options: ["22", "23", "24", "21"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "Which shape has 4 equal sides and 4 right angles?",
    options: ["A pentagon", "A circle", "A square", "A triangle"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 8 x 4?",
    options: ["32", "24", "36", "28"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 64 divided by 8?",
    options: ["9", "8", "7", "6"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 14 + 29?",
    options: ["33", "44", "43", "42"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 100 - 45?",
    options: ["56", "45", "55", "65"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 5 x 12?",
    options: ["50", "65", "60", "55"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the square root of 144?",
    options: ["14", "11", "12", "10"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 15% of 200?",
    options: ["30", "35", "20", "25"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 2 + 3 x 4?",
    options: ["10", "14", "20", "24"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 3/4 as a decimal?",
    options: ["0.75", "0.43", "0.34", "0.65"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 25 x 4?",
    options: ["90", "125", "75", "100"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the perimeter of a square with sides of 5 cm?",
    options: ["25 cm", "15 cm", "10 cm", "20 cm"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the area of a rectangle that is 6 cm by 4 cm?",
    options: ["24 square cm", "28 square cm", "10 square cm", "20 square cm"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 144 divided by 12?",
    options: ["11", "12", "14", "10"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 0.5 + 0.25?",
    options: ["0.55", "0.75", "0.8", "0.7"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "How many degrees are there in a triangle in total?",
    options: ["270", "360", "180", "90"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 17 x 3?",
    options: ["57", "54", "47", "51"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 1/2 + 1/4?",
    options: ["1/6", "3/4", "2/6", "2/4"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 20% of 50?",
    options: ["5", "25", "10", "20"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "Which of these numbers is a prime number?",
    options: ["21", "27", "13", "15"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 9 squared?",
    options: ["18", "99", "81", "72"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 7 x 12?",
    options: ["84", "72", "96", "82"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 3 cubed (3 x 3 x 3)?",
    options: ["81", "9", "18", "27"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the average of 4, 6 and 8?",
    options: ["6", "8", "7", "5"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 200 x 5?",
    options: ["500", "2000", "1500", "1000"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 3.5 + 2.7?",
    options: ["5.2", "6.2", "5.7", "6.1"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "How many centimetres are in a metre?",
    options: ["10", "100", "1000", "50"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "Which is the largest fraction?",
    options: ["2/3", "1/2", "1/4", "3/4"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 1000 divided by 8?",
    options: ["100", "125", "120", "150"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 45 + 38?",
    options: ["83", "73", "93", "82"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the next number: 3, 6, 12, 24, ...?",
    options: ["42", "36", "30", "48"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "How many sides does an octagon have?",
    options: ["10", "6", "7", "8"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the sum of the angles in a rectangle?",
    options: ["360 degrees", "270 degrees", "90 degrees", "180 degrees"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 2 to the power of 5?",
    options: ["16", "32", "25", "10"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 60% of 100?",
    options: ["60", "6", "40", "66"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the next prime number after 7?",
    options: ["9", "8", "11", "13"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "If a pen costs 150 naira, how much do 4 pens cost?",
    options: ["650 naira", "500 naira", "600 naira", "450 naira"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 7 + 8 x 2?",
    options: ["16", "22", "23", "30"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "Which of these numbers is a multiple of 7?",
    options: ["50", "45", "38", "42"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 2 to the power of 10?",
    options: ["2048", "1000", "1024", "512"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the next prime number after 13?",
    options: ["17", "16", "15", "19"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the square root of 169?",
    options: ["13", "15", "14", "12"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 15 x 15?",
    options: ["235", "250", "225", "215"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the sum of the interior angles of a pentagon?",
    options: ["360 degrees", "450 degrees", "540 degrees", "720 degrees"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 3/5 of 250?",
    options: ["175", "125", "120", "150"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "Solve for x: 3x + 5 = 20",
    options: ["6", "15", "4", "5"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the lowest common multiple of 4 and 6?",
    options: ["10", "2", "24", "12"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the highest common factor of 12 and 18?",
    options: ["6", "3", "2", "9"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the value of pi to two decimal places?",
    options: ["3.24", "3.12", "3.41", "3.14"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the area of a circle with radius 7, using pi = 22/7?",
    options: ["44", "154", "49", "308"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 12.5% as a fraction?",
    options: ["1/5", "1/8", "1/6", "1/4"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 25 squared?",
    options: ["600", "525", "650", "625"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the smallest prime number?",
    options: ["3", "2", "0", "1"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the cube root of 125?",
    options: ["5", "15", "10", "25"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 7! divided by 6! (7 factorial divided by 6 factorial)?",
    options: ["7", "6", "1", "42"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "How many diagonals does a hexagon have?",
    options: ["6", "9", "12", "15"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "If x = 4, what is x squared plus 2x?",
    options: ["32", "16", "20", "24"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the sum of all the whole numbers from 1 to 10?",
    options: ["50", "60", "55", "45"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 0.2 x 0.3?",
    options: ["0.6", "0.05", "0.5", "0.06"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 1/3 + 1/6?",
    options: ["2/3", "1/9", "1/2", "2/9"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the next number: 1, 1, 2, 3, 5, 8, ...?",
    options: ["11", "10", "12", "13"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "In a right-angled triangle with shorter sides 3 and 4, how long is the longest side?",
    options: ["5", "12", "7", "6"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 25% of 25% of 1000?",
    options: ["62.5", "250", "6.25", "125"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 10 to the power of 3?",
    options: ["100", "10,000", "30", "1000"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 2/3 of 99?",
    options: ["66", "33", "69", "63"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "How many faces does a cube have?",
    options: ["6", "12", "8", "4"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "How many edges does a cube have?",
    options: ["8", "10", "12", "6"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the sum of the first five odd numbers (1 + 3 + 5 + 7 + 9)?",
    options: ["25", "16", "20", "30"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 8% of 250?",
    options: ["30", "20", "25", "16"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the mean of 2, 5, 7, 10 and 11?",
    options: ["7", "6", "35", "8"],
    answer: 0
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "A train travels 60 km in 1 hour. How far does it go in 2.5 hours at the same speed?",
    options: ["160 km", "130 km", "120 km", "150 km"],
    answer: 3
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 999 + 111?",
    options: ["1100", "1099", "1010", "1110"],
    answer: 3
  },

  // ----- Technology -----
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which language is used to style web pages?",
    options: ["SQL", "HTML", "CSS", "Python"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Core Processing Update", "Computer Personal Unit", "Central Program Utility"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which device do you use to type?",
    options: ["A printer", "A speaker", "A monitor", "A keyboard"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does WWW stand for?",
    options: ["World Wide Wire", "Wide World Web", "World Wide Web", "Web Wide World"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which of these is a web browser?",
    options: ["Windows", "Photoshop", "Excel", "Chrome"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do we call a small picture that represents a program?",
    options: ["A folder", "An icon", "A cursor", "A window"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which company makes the iPhone?",
    options: ["Sony", "Nokia", "Apple", "Samsung"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do we call the screen of a computer?",
    options: ["The mouse", "The router", "The monitor", "The keyboard"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which device do you use to point and click on a computer screen?",
    options: ["A scanner", "A printer", "A mouse", "A webcam"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does USB stand for?",
    options: ["United System Board", "Universal Software Backup", "Universal Serial Bus", "Unified Serial Box"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which part of a computer stores your files even when it is switched off?",
    options: ["The mouse", "The monitor", "The hard drive", "The speaker"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do we call a program that lets you look at websites?",
    options: ["A compiler", "A browser", "A printer", "A router"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which key deletes the character to the left of the cursor?",
    options: ["Tab", "Enter", "Shift", "Backspace"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which language is used to build the structure of a web page?",
    options: ["C", "HTML", "CSS", "Java"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does Wi-Fi let devices do?",
    options: ["Charge batteries", "Play music only", "Print documents", "Connect to the internet without wires"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which symbol is always in an email address?",
    options: ["@", "#", "%", "&"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which of these is a social media app?",
    options: ["Notepad", "Instagram", "Calculator", "Clock"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do we call a person who writes computer programs?",
    options: ["A painter", "A pilot", "A plumber", "A programmer"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What is the main circuit board of a computer called?",
    options: ["The speaker", "The keyboard", "The fan", "The motherboard"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does a printer produce?",
    options: ["Internet", "Sound", "Electricity", "Paper copies"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which part of a laptop is used to take photos and join video calls?",
    options: ["The scanner", "The webcam", "The joystick", "The router"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do we call a set of instructions that tells a computer what to do?",
    options: ["A cable", "A plug", "A program", "A pixel"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which of these is an operating system?",
    options: ["Excel", "Zoom", "Windows", "Chrome"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does PC stand for in computers?",
    options: ["Personal computer", "Portable cable", "Program control", "Public computer"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which key do you hold to type a capital letter?",
    options: ["Delete", "Esc", "Tab", "Shift"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do we call the small blinking line where you type?",
    options: ["The folder", "The pixel", "The cursor", "The icon"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which of these is a search engine?",
    options: ["Notepad", "Paint", "Excel", "Google"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What are the tiny dots that make up a digital picture called?",
    options: ["Cables", "Bytes", "Chips", "Pixels"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which of these can you use to make a video call?",
    options: ["Zoom", "Notepad", "Paint", "Calculator"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does it mean to download a file?",
    options: ["To print it", "To turn off the computer", "To delete it", "To copy it from the internet to your device"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What do the letters .jpg or .png at the end of a file name tell you?",
    options: ["The type of file", "The owner of the file", "The size of the file", "The date of the file"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What is a password used for?",
    options: ["To print documents", "To save electricity", "To keep an account secure", "To make a computer faster"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which of these computers is easy to carry around?",
    options: ["A server rack", "A mainframe", "A desktop tower", "A laptop"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does online mean?",
    options: ["Switched off", "Out of battery", "Connected to the internet", "Broken"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which HTML tag creates the largest heading?",
    options: ["<head>", "<header>", "<h6>", "<h1>"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which symbols start a one-line comment in JavaScript?",
    options: ["//", "**", "#", "<!--"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does HTML stand for?",
    options: ["Hyper Transfer Markup Language", "Home Tool Markup Language", "HyperText Markup Language", "High Text Machine Language"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does CSS stand for?",
    options: ["Creative Style System", "Cascading Style Sheets", "Computer Style Sheets", "Colourful Style Sheets"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which HTML tag creates a link?",
    options: ["<url>", "<link>", "<a>", "<href>"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which CSS property changes the colour of text?",
    options: ["color", "font-style", "background", "text-align"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does console.log() do in JavaScript?",
    options: ["Prints a message in the console", "Opens a new page", "Saves a file", "Deletes a variable"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which JavaScript data type holds true or false?",
    options: ["String", "Boolean", "Number", "Array"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which operator checks that two values are equal and of the same type in JavaScript?",
    options: ["!=", "=", "===", "=>"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does an array hold?",
    options: ["A picture", "A list of items", "Only one number", "A colour"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which array method adds an item to the end of an array?",
    options: ["shift", "pop", "slice", "push"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What is the usual file ending for a JavaScript file?",
    options: [".html", ".js", ".jv", ".javascript"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which HTML tag holds the visible content of a web page?",
    options: ["<title>", "<body>", "<meta>", "<head>"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does IP stand for in IP address?",
    options: ["Internal Program", "Internet Protocol", "Instant Page", "Internet Provider"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which is bigger: a kilobyte or a megabyte?",
    options: ["They are equal", "A megabyte", "A bit", "A kilobyte"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "How many bits are in a byte?",
    options: ["4", "2", "16", "8"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What do we call a tool that helps find and fix mistakes in code?",
    options: ["A browser", "A router", "A printer", "A debugger"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which key opens the developer tools in many browsers?",
    options: ["F5", "F9", "F12", "F1"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does bug mean in programming?",
    options: ["A virus in a person", "A mistake in a program", "A type of keyboard", "A very fast computer"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which CSS property sets the space inside an element, around its content?",
    options: ["display", "padding", "margin", "border"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which HTML tag creates a bullet list?",
    options: ["<li>", "<ol>", "<ul>", "<list>"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does URL stand for?",
    options: ["User Resource List", "Uniform Resource Locator", "Universal Remote Link", "Unified Reading Level"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What do we use to store a value in JavaScript?",
    options: ["A tag", "A variable", "A comment", "A selector"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which of these is a programming language?",
    options: ["Windows", "Chrome", "Python", "Wi-Fi"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What do we call software designed to harm a computer?",
    options: ["Freeware", "Firmware", "Hardware", "Malware"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does the Back button in a browser do?",
    options: ["Closes the computer", "Goes to the previous page", "Restarts the router", "Saves the page"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which password is the most secure?",
    options: ["password", "Your name", "A long mix of letters, numbers and symbols", "1234"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does a function do in programming?",
    options: ["Turns off the computer", "Runs a block of code when it is called", "Stores a picture", "Changes your screen colour"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does Git help programmers do?",
    options: ["Draw pictures", "Track changes to their code", "Make websites load faster", "Send emails"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What is GitHub?",
    options: ["A graphics card", "A web browser", "A website that stores Git projects", "A programming language"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which CSS selector targets the element with id=\"box\"?",
    options: ["box", "*box", ".box", "#box"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which CSS selector targets elements with class=\"card\"?",
    options: ["#card", ".card", "card", "*card"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "What does responsive design mean?",
    options: ["A page that talks to you", "A web page that adapts to different screen sizes", "A page with only animations", "A very fast server"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which JavaScript keyword declares a variable that cannot be reassigned?",
    options: ["let", "const", "static", "var"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which array method removes the last item of an array?",
    options: ["splice", "shift", "push", "pop"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does JSON.parse do?",
    options: ["Turns an object into text", "Turns JSON text into an object", "Sorts an array", "Deletes JSON"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does JSON.stringify do?",
    options: ["Adds numbers", "Turns text into an object", "Turns an object into text", "Prints to the console"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which array method makes a new array with only the items that pass a test?",
    options: ["reduce", "map", "filter", "forEach"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which keyword lets a function wait for a promise inside it?",
    options: ["await", "let", "const", "import"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does typeof \"hello\" give in JavaScript?",
    options: ["char", "string", "word", "text"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does 5 > 3 && 2 > 4 give in JavaScript?",
    options: ["true", "undefined", "false", "null"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is 10 % 3 in JavaScript?",
    options: ["0", "1", "10", "3"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which HTTP status code means Not Found?",
    options: ["301", "500", "404", "200"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does HTTPS add compared with HTTP?",
    options: ["Larger images", "More colours", "Faster video", "Encryption for secure connections"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which data structure works first in, first out?",
    options: ["A set", "A queue", "A stack", "A tree"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which data structure works last in, first out?",
    options: ["A queue", "A table", "A map", "A stack"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does API stand for?",
    options: ["Advanced Processing Input", "Automatic Page Integration", "Applied Program Internet", "Application Programming Interface"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does DNS do?",
    options: ["Turns website names into IP addresses", "Cleans viruses", "Stores passwords", "Plays videos"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is the binary number 101 in decimal?",
    options: ["5", "3", "7", "6"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is the decimal number 8 in binary?",
    options: ["1000", "1010", "1100", "100"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which CSS declaration stacks the items of a flex container in a column?",
    options: ["display: block", "flex-direction: column", "justify-content: center", "align-items: center"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which of these is a NoSQL database from Google?",
    options: ["PostgreSQL", "SQLite", "MySQL", "Firestore"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is a promise in JavaScript?",
    options: ["A type of loop", "An object for a value that will arrive later", "A CSS rule", "A variable that never changes"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is a service worker used for in a web app?",
    options: ["Changing fonts", "Storing passwords", "Drawing the page", "Running in the background to handle caching and offline use"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which file tells a phone how to install a web app, with its name and icons?",
    options: ["app.js", "style.css", "manifest.json", "index.html"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which CSS unit is relative to the width of the screen?",
    options: ["px", "pt", "vw", "cm"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does refactoring mean?",
    options: ["Improving code without changing what it does", "Deleting a project", "Adding new features", "Making code slower"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does a commit do in Git?",
    options: ["Opens a website", "Saves a snapshot of your changes", "Deletes a file", "Starts a game"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is a branch in Git?",
    options: ["A broken file", "A backup drive", "A type of password", "A separate line of work in a project"],
    answer: 3
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does DOM stand for?",
    options: ["Data Output Mode", "Display Object Menu", "Document Object Model", "Digital Order Method"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which loop keeps running as long as its condition is true?",
    options: ["if", "switch", "while", "try"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What does NaN mean in JavaScript?",
    options: ["No actual Name", "New array Node", "Not a Number", "Null and None"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which of these is NOT a basic data type in JavaScript?",
    options: ["String", "Character", "Undefined", "Boolean"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is the name of a computer's temporary working memory?",
    options: ["SSD", "RAM", "CPU", "ROM"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "What is two-factor authentication?",
    options: ["Using two passwords of the same kind", "Using two different proofs to sign in", "Signing in twice", "Having two accounts"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which HTML attribute gives an image a text description for screen readers?",
    options: ["href", "alt", "src", "class"],
    answer: 1
  }
];
