import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Ear,
  FileText,
  Keyboard,
  Mic,
  MicOff,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";

const LANGUAGE_CONFIG = {
  English: {
    code: "en-IN",
    welcome:
      "Hello. I am MediKiosk, your AI clinical assistant. Your medical record is already available. I will ask you a few questions about how you are feeling today. Please answer in your own words. You can speak naturally.",
    firstQuestion:
      "What brings you here today? Please tell me what problem or symptom you are experiencing.",
    listening: "I'm listening...",
    thinking: "Let me understand that...",
    speakAgain: "Could you please tell me that again?",
    fallback:
      "You can speak your answer, or type it below if voice input is unavailable.",
    finished:
      "Thank you. I have collected the important information from your history.",
    next: "Next question",
    finish: "Complete interview",
  },

  Hindi: {
    code: "hi-IN",
    welcome:
      "नमस्ते। मैं MediKiosk, आपका AI स्वास्थ्य सहायक हूँ। आपका मेडिकल रिकॉर्ड पहले से उपलब्ध है। मैं आज आपकी तबीयत के बारे में कुछ सवाल पूछूँगा। कृपया अपने शब्दों में स्वाभाविक रूप से जवाब दें।",
    firstQuestion:
      "आप आज किस समस्या के लिए आए हैं? कृपया बताइए कि आपको क्या परेशानी या लक्षण हो रहे हैं।",
    listening: "मैं सुन रहा हूँ...",
    thinking: "मैं आपके जवाब को समझ रहा हूँ...",
    speakAgain:
      "कृपया अपना जवाब एक बार फिर बताइए।",
    fallback:
      "आप अपना जवाब बोल सकते हैं। अगर आवाज़ उपलब्ध नहीं है, तो नीचे लिख भी सकते हैं।",
    finished:
      "धन्यवाद। मैंने आपकी हिस्ट्री की महत्वपूर्ण जानकारी रिकॉर्ड कर ली है।",
    next: "अगला सवाल",
    finish: "इंटरव्यू पूरा करें",
  },

  Telugu: {
    code: "te-IN",
    welcome:
      "నమస్కారం. నేను MediKiosk, మీ AI ఆరోగ్య సహాయకుడిని. మీ వైద్య రికార్డు ఇప్పటికే అందుబాటులో ఉంది. ఈ రోజు మీ ఆరోగ్యం గురించి కొన్ని ప్రశ్నలు అడుగుతాను. దయచేసి మీకు అనిపించిన విధంగా సహజంగా సమాధానం చెప్పండి.",
    firstQuestion:
      "మీరు ఈ రోజు ఏ సమస్యతో వచ్చారు? మీకు ఉన్న ఇబ్బంది లేదా లక్షణం గురించి మీ మాటల్లో చెప్పండి.",
    listening: "నేను వింటున్నాను...",
    thinking: "మీ సమాధానాన్ని అర్థం చేసుకుంటున్నాను...",
    speakAgain:
      "దయచేసి మీ సమాధానాన్ని మరోసారి చెప్పగలరా?",
    fallback:
      "మీరు మీ సమాధానాన్ని మాట్లాడవచ్చు. వాయిస్ అందుబాటులో లేకపోతే కింద టైప్ చేయవచ్చు.",
    finished:
      "ధన్యవాదాలు. మీ ఆరోగ్య చరిత్రలో ముఖ్యమైన సమాచారాన్ని నమోదు చేశాను.",
    next: "తదుపరి ప్రశ్న",
    finish: "ఇంటర్వ్యూ పూర్తి చేయండి",
  },

  Tamil: {
    code: "ta-IN",
    welcome:
      "வணக்கம். நான் MediKiosk, உங்கள் AI சுகாதார உதவியாளர். உங்கள் மருத்துவப் பதிவு ஏற்கனவே உள்ளது. இன்று உங்கள் உடல்நிலை குறித்து சில கேள்விகள் கேட்பேன். உங்கள் சொந்த வார்த்தைகளில் இயல்பாக பதிலளிக்கவும்.",
    firstQuestion:
      "இன்று எந்த பிரச்சினைக்காக வந்துள்ளீர்கள்? உங்களுக்கு இருக்கும் பிரச்சினை அல்லது அறிகுறியை உங்கள் சொந்த வார்த்தைகளில் சொல்லுங்கள்.",
    listening: "நான் கேட்கிறேன்...",
    thinking: "உங்கள் பதிலைப் புரிந்துகொள்கிறேன்...",
    speakAgain:
      "தயவுசெய்து உங்கள் பதிலை மீண்டும் சொல்ல முடியுமா?",
    fallback:
      "உங்கள் பதிலைப் பேசலாம். குரல் வசதி இல்லையெனில் கீழே தட்டச்சு செய்யலாம்.",
    finished:
      "நன்றி. உங்கள் மருத்துவ வரலாற்றில் முக்கியமான தகவல்களை பதிவு செய்துள்ளேன்.",
    next: "அடுத்த கேள்வி",
    finish: "நேர்காணலை முடிக்கவும்",
  },
};

const QUESTION_BANK = {
  English: {
    default: [
      "When did this problem first start?",
      "Is the problem present all the time, or does it come and go?",
      "How would you describe the problem in your own words?",
      "How severe is it right now, from 0 to 10?",
      "Has it been getting better, worse, or staying about the same?",
      "Is there anything that makes it better or worse?",
      "Have you noticed any other symptoms along with it?",
    ],

    chest: [
      "When did the chest pain first begin?",
      "Where exactly do you feel the pain?",
      "What does the pain feel like — pressure, heaviness, burning, stabbing, or something else?",
      "Does the pain move to your arm, shoulder, back, neck, or jaw?",
      "Does anything make the pain worse, such as walking or climbing stairs?",
      "Have you had shortness of breath, sweating, dizziness, or nausea with the pain?",
      "Have you experienced anything like this before?",
    ],

    fever: [
      "When did the fever start?",
      "Have you measured your temperature? If yes, what was the highest reading?",
      "Do you have chills or shivering?",
      "Have you noticed cough, sore throat, body aches, vomiting, or loose stools?",
      "Have you travelled recently or been around anyone who was unwell?",
      "Have you taken any medicine for the fever?",
    ],

    cough: [
      "When did the cough begin?",
      "Is the cough dry, or are you bringing up phlegm?",
      "What colour is the phlegm, if any?",
      "Do you have fever, chest pain, or difficulty breathing?",
      "Does the cough get worse at night, in the morning, or with activity?",
      "Do you smoke or regularly breathe in smoke or dust?",
    ],

    headache: [
      "When did the headache begin?",
      "Where on your head do you feel the pain?",
      "What does the headache feel like — throbbing, pressure, tightness, or something else?",
      "How severe is the headache from 0 to 10?",
      "Did the headache begin suddenly or gradually?",
      "Have you had vomiting, vision changes, weakness, numbness, confusion, or difficulty speaking?",
      "Have you experienced similar headaches before?",
    ],

    abdominal: [
      "When did the abdominal pain begin?",
      "Where exactly in your abdomen do you feel the pain?",
      "Does the pain move to another area?",
      "Does eating make it better or worse?",
      "Have you had vomiting, loose stools, constipation, or blood in your stool?",
      "Have you had fever or difficulty passing urine?",
    ],
  },

  Hindi: {
    default: [
      "यह समस्या पहली बार कब शुरू हुई?",
      "क्या यह समस्या लगातार रहती है या बीच-बीच में होती है?",
      "आप इस समस्या को अपने शब्दों में कैसे बताएँगे?",
      "अभी इसकी परेशानी 0 से 10 में कितनी है?",
      "क्या समस्या बेहतर हो रही है, बढ़ रही है या लगभग वैसी ही है?",
      "क्या कोई चीज़ इसे बेहतर या खराब करती है?",
      "क्या इसके साथ कोई और लक्षण भी हैं?",
    ],

    chest: [
      "सीने में दर्द पहली बार कब शुरू हुआ?",
      "सीने में दर्द ठीक कहाँ महसूस होता है?",
      "दर्द कैसा लगता है — दबाव, भारीपन, जलन, चुभन या कुछ और?",
      "क्या दर्द हाथ, कंधे, पीठ, गर्दन या जबड़े तक जाता है?",
      "क्या चलने या सीढ़ियाँ चढ़ने से दर्द बढ़ता है?",
      "क्या दर्द के साथ सांस फूलना, पसीना, चक्कर या जी मिचलाना हुआ?",
      "क्या आपको पहले भी ऐसा दर्द हुआ है?",
    ],

    fever: [
      "बुखार कब शुरू हुआ?",
      "क्या आपने तापमान नापा है? अगर हाँ, तो सबसे अधिक तापमान कितना था?",
      "क्या ठंड लगना या कंपकंपी होती है?",
      "क्या खाँसी, गले में दर्द, शरीर में दर्द, उल्टी या दस्त हैं?",
      "क्या आपने हाल में यात्रा की है या किसी बीमार व्यक्ति के संपर्क में आए हैं?",
      "क्या आपने बुखार के लिए कोई दवा ली है?",
    ],

    cough: [
      "खाँसी कब शुरू हुई?",
      "क्या खाँसी सूखी है या बलगम आता है?",
      "अगर बलगम आता है, तो उसका रंग कैसा है?",
      "क्या बुखार, सीने में दर्द या सांस लेने में परेशानी है?",
      "खाँसी रात में, सुबह या काम करने पर ज्यादा होती है?",
      "क्या आप धूम्रपान करते हैं या धुएँ या धूल के संपर्क में रहते हैं?",
    ],

    headache: [
      "सिरदर्द कब शुरू हुआ?",
      "सिर के किस हिस्से में दर्द होता है?",
      "दर्द कैसा लगता है — धड़कने जैसा, दबाव, कसाव या कुछ और?",
      "सिरदर्द 0 से 10 में कितना तेज है?",
      "सिरदर्द अचानक शुरू हुआ या धीरे-धीरे?",
      "क्या उल्टी, दिखाई देने में बदलाव, कमजोरी, सुन्नपन, भ्रम या बोलने में परेशानी हुई?",
      "क्या आपको पहले भी ऐसा सिरदर्द हुआ है?",
    ],

    abdominal: [
      "पेट में दर्द कब शुरू हुआ?",
      "पेट के किस हिस्से में दर्द है?",
      "क्या दर्द किसी दूसरी जगह जाता है?",
      "खाना खाने से दर्द बेहतर होता है या बढ़ता है?",
      "क्या उल्टी, दस्त, कब्ज या मल में खून है?",
      "क्या बुखार है या पेशाब करने में परेशानी है?",
    ],
  },

  Telugu: {
    default: [
      "ఈ సమస్య మొదట ఎప్పుడు ప్రారంభమైంది?",
      "ఈ సమస్య ఎప్పుడూ ఉంటుందా లేదా అప్పుడప్పుడు వస్తుందా?",
      "ఈ సమస్య ఎలా ఉందో మీ మాటల్లో చెప్పగలరా?",
      "ప్రస్తుతం ఈ సమస్య తీవ్రత 0 నుండి 10 వరకు ఎంతగా ఉంది?",
      "ఇది తగ్గుతోందా, పెరుగుతోందా లేదా అలాగే ఉందా?",
      "ఏదైనా చేయడం వల్ల ఇది తగ్గుతుందా లేదా పెరుగుతుందా?",
      "దీనితో పాటు మరే ఇతర లక్షణాలు ఉన్నాయా?",
    ],

    chest: [
      "ఛాతీ నొప్పి మొదట ఎప్పుడు ప్రారంభమైంది?",
      "ఛాతీలో నొప్పి ఖచ్చితంగా ఎక్కడ ఉంది?",
      "నొప్పి ఎలా అనిపిస్తుంది — ఒత్తిడి, బరువు, మంట, గుచ్చినట్లు లేదా మరేదైనా?",
      "నొప్పి చేయి, భుజం, వెన్ను, మెడ లేదా దవడకు వెళ్తుందా?",
      "నడవడం లేదా మెట్లు ఎక్కడం వల్ల నొప్పి పెరుగుతుందా?",
      "నొప్పితో పాటు శ్వాస తీసుకోవడంలో ఇబ్బంది, చెమటలు, తల తిరగడం లేదా వాంతులు వచ్చినట్లు అనిపించిందా?",
      "ఇంతకు ముందు కూడా ఇలాంటి నొప్పి వచ్చిందా?",
    ],

    fever: [
      "జ్వరం ఎప్పుడు మొదలైంది?",
      "మీరు ఉష్ణోగ్రత కొలిచారా? కొలిస్తే అత్యధికంగా ఎంత వచ్చింది?",
      "చలి లేదా వణుకు వస్తుందా?",
      "దగ్గు, గొంతు నొప్పి, శరీర నొప్పులు, వాంతులు లేదా విరేచనాలు ఉన్నాయా?",
      "ఇటీవల ఎక్కడికైనా ప్రయాణించారా లేదా అనారోగ్యంగా ఉన్న వ్యక్తిని కలిశారా?",
      "జ్వరం కోసం ఏదైనా మందు తీసుకున్నారా?",
    ],

    cough: [
      "దగ్గు ఎప్పుడు ప్రారంభమైంది?",
      "దగ్గు పొడిగా ఉందా లేదా కఫం వస్తుందా?",
      "కఫం వస్తే దాని రంగు ఎలా ఉంది?",
      "జ్వరం, ఛాతీ నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా?",
      "రాత్రి, ఉదయం లేదా పని చేసినప్పుడు దగ్గు ఎక్కువగా వస్తుందా?",
      "మీరు పొగ తాగుతారా లేదా పొగ, దుమ్ముకు తరచుగా గురవుతారా?",
    ],

    headache: [
      "తలనొప్పి ఎప్పుడు ప్రారంభమైంది?",
      "తలలో ఏ భాగంలో నొప్పి ఉంది?",
      "నొప్పి ఎలా అనిపిస్తుంది — కొట్టుకున్నట్లు, ఒత్తిడి, బిగుతుగా లేదా మరేదైనా?",
      "తలనొప్పి తీవ్రత 0 నుండి 10 వరకు ఎంతగా ఉంది?",
      "తలనొప్పి అకస్మాత్తుగా మొదలైందా లేదా క్రమంగా మొదలైందా?",
      "వాంతులు, చూపులో మార్పు, బలహీనత, తిమ్మిరి, గందరగోళం లేదా మాట్లాడడంలో ఇబ్బంది ఉందా?",
      "ఇంతకు ముందు కూడా ఇలాంటి తలనొప్పి వచ్చిందా?",
    ],

    abdominal: [
      "కడుపు నొప్పి ఎప్పుడు ప్రారంభమైంది?",
      "కడుపులో ఏ భాగంలో నొప్పి ఉంది?",
      "నొప్పి మరొక ప్రాంతానికి వెళ్తుందా?",
      "తినడం వల్ల నొప్పి తగ్గుతుందా లేదా పెరుగుతుందా?",
      "వాంతులు, విరేచనాలు, మలబద్ధకం లేదా మలంలో రక్తం ఉందా?",
      "జ్వరం లేదా మూత్రం పోయేటప్పుడు ఇబ్బంది ఉందా?",
    ],
  },

  Tamil: {
    default: [
      "இந்த பிரச்சினை முதலில் எப்போது தொடங்கியது?",
      "இந்த பிரச்சினை எப்போதும் இருக்கிறதா அல்லது அவ்வப்போது வருகிறதா?",
      "இந்த பிரச்சினையை உங்கள் சொந்த வார்த்தைகளில் எப்படி விவரிப்பீர்கள்?",
      "இப்போது இதன் தீவிரம் 0 முதல் 10 வரை எவ்வளவு?",
      "இது குறைகிறதா, அதிகரிக்கிறதா அல்லது அப்படியே இருக்கிறதா?",
      "எதனால் இது குறைகிறது அல்லது அதிகரிக்கிறது?",
      "இதனுடன் வேறு ஏதேனும் அறிகுறிகள் உள்ளனவா?",
    ],

    chest: [
      "நெஞ்சு வலி எப்போது தொடங்கியது?",
      "நெஞ்சில் எந்த இடத்தில் வலி உள்ளது?",
      "வலி எப்படி இருக்கிறது — அழுத்தம், பாரம், எரிச்சல், குத்துவது போல அல்லது வேறு விதமாகவா?",
      "வலி கை, தோள், முதுகு, கழுத்து அல்லது தாடைக்கு செல்கிறதா?",
      "நடப்பது அல்லது படிக்கட்டு ஏறுவது வலியை அதிகரிக்கிறதா?",
      "வலியுடன் மூச்சுத்திணறல், வியர்வை, தலைசுற்றல் அல்லது குமட்டல் ஏற்பட்டதா?",
      "இதுபோன்ற வலி முன்பும் ஏற்பட்டுள்ளதா?",
    ],

    fever: [
      "காய்ச்சல் எப்போது தொடங்கியது?",
      "வெப்பநிலையை அளந்தீர்களா? அளந்திருந்தால் அதிகபட்சமாக எவ்வளவு இருந்தது?",
      "குளிர் அல்லது நடுக்கம் உள்ளதா?",
      "இருமல், தொண்டை வலி, உடல் வலி, வாந்தி அல்லது வயிற்றுப்போக்கு உள்ளதா?",
      "சமீபத்தில் பயணம் செய்தீர்களா அல்லது உடல்நிலை சரியில்லாத ஒருவரை சந்தித்தீர்களா?",
      "காய்ச்சலுக்காக ஏதேனும் மருந்து எடுத்தீர்களா?",
    ],

    cough: [
      "இருமல் எப்போது தொடங்கியது?",
      "இருமல் வறண்டதா அல்லது சளி வருகிறதா?",
      "சளி வந்தால் அதன் நிறம் எப்படி உள்ளது?",
      "காய்ச்சல், நெஞ்சு வலி அல்லது மூச்சுத்திணறல் உள்ளதா?",
      "இரவில், காலையில் அல்லது வேலை செய்யும்போது இருமல் அதிகமாகிறதா?",
      "நீங்கள் புகைபிடிக்கிறீர்களா அல்லது புகை அல்லது தூசிக்கு அடிக்கடி ஆளாகிறீர்களா?",
    ],

    headache: [
      "தலைவலி எப்போது தொடங்கியது?",
      "தலையின் எந்த பகுதியில் வலி உள்ளது?",
      "வலி எப்படி இருக்கிறது — துடிப்பது போல, அழுத்தம், இறுக்கம் அல்லது வேறு விதமாகவா?",
      "தலைவலியின் தீவிரம் 0 முதல் 10 வரை எவ்வளவு?",
      "தலைவலி திடீரென தொடங்கியதா அல்லது மெதுவாக தொடங்கியதா?",
      "வாந்தி, பார்வை மாற்றம், பலவீனம், உணர்வின்மை, குழப்பம் அல்லது பேசுவதில் சிரமம் உள்ளதா?",
      "இதுபோன்ற தலைவலி முன்பும் ஏற்பட்டுள்ளதா?",
    ],

    abdominal: [
      "வயிற்று வலி எப்போது தொடங்கியது?",
      "வயிற்றின் எந்த பகுதியில் வலி உள்ளது?",
      "வலி வேறு பகுதிக்கு செல்கிறதா?",
      "சாப்பிடுவதால் வலி குறைகிறதா அல்லது அதிகரிக்கிறதா?",
      "வாந்தி, வயிற்றுப்போக்கு, மலச்சிக்கல் அல்லது மலத்தில் இரத்தம் உள்ளதா?",
      "காய்ச்சல் அல்லது சிறுநீர் கழிப்பதில் சிரமம் உள்ளதா?",
    ],
  },
};

const RED_FLAG_PATTERNS = [
  {
    id: "chest-breathlessness",
    keywords: [
      "chest pain",
      "chest pain and shortness",
      "shortness of breath",
      "difficulty breathing",
      "can't breathe",
      "cannot breathe",
      "सांस फूल",
      "सांस लेने में परेशानी",
      "ఊపిరి తీసుకోవడంలో ఇబ్బంది",
      "மூச்சுத்திணறல்",
    ],
    label: "Chest symptoms with breathing difficulty",
  },
  {
    id: "severe-chest-pain",
    keywords: [
      "severe chest pain",
      "crushing chest pain",
      "heavy chest pain",
      "सीने में बहुत तेज दर्द",
      "ఛాతీలో తీవ్రమైన నొప్పి",
      "கடுமையான நெஞ்சு வலி",
    ],
    label: "Severe chest discomfort reported",
  },
  {
    id: "neurological",
    keywords: [
      "weakness",
      "one side weak",
      "face drooping",
      "slurred speech",
      "difficulty speaking",
      "confusion",
      "बेहोशी",
      "अचानक कमजोरी",
      "बोलने में परेशानी",
      "ఒక వైపు బలహీనత",
      "మాట్లాడడంలో ఇబ్బంది",
      "முகம் சாய்வு",
      "பேசுவதில் சிரமம்",
    ],
    label: "Neurological symptom requiring review",
  },
  {
    id: "fainting",
    keywords: [
      "fainted",
      "passed out",
      "lost consciousness",
      "बेहोश",
      "बेहोशी",
      "స్పృహ కోల్పోయాను",
      "மயக்கம்",
    ],
    label: "Loss of consciousness reported",
  },
  {
    id: "bleeding",
    keywords: [
      "blood in vomit",
      "vomiting blood",
      "blood in stool",
      "black stool",
      "coughing blood",
      "खून की उल्टी",
      "मल में खून",
      "రక్తం వాంతి",
      "మలంలో రక్తం",
      "வாந்தியில் இரத்தம்",
      "மலத்தில் இரத்தம்",
    ],
    label: "Bleeding symptom reported",
  },
];

function normalizeText(text) {
  return String(text || "").toLowerCase().trim();
}

function detectRedFlags(text) {
  const normalized = normalizeText(text);

  return RED_FLAG_PATTERNS.filter((flag) =>
    flag.keywords.some((keyword) =>
      normalized.includes(keyword.toLowerCase())
    )
  );
}

function detectSymptomType(text) {
  const normalized = normalizeText(text);

  if (
    normalized.includes("chest") ||
    normalized.includes("सीने") ||
    normalized.includes("छाती") ||
    normalized.includes("ఛాతీ") ||
    normalized.includes("నెഞ്ചు") ||
    normalized.includes("நெஞ்சு")
  ) {
    return "chest";
  }

  if (
    normalized.includes("fever") ||
    normalized.includes("बुखार") ||
    normalized.includes("జ్వరం") ||
    normalized.includes("காய்ச்சல்")
  ) {
    return "fever";
  }

  if (
    normalized.includes("cough") ||
    normalized.includes("खांसी") ||
    normalized.includes("खाँसी") ||
    normalized.includes("దగ్గు") ||
    normalized.includes("இருமல்")
  ) {
    return "cough";
  }

  if (
    normalized.includes("headache") ||
    normalized.includes("सिरदर्द") ||
    normalized.includes("తలనొప్పి") ||
    normalized.includes("தலைவலி")
  ) {
    return "headache";
  }

  if (
    normalized.includes("stomach") ||
    normalized.includes("abdominal") ||
    normalized.includes("abdomen") ||
    normalized.includes("पेट") ||
    normalized.includes("కడుపు") ||
    normalized.includes("வயிறு")
  ) {
    return "abdominal";
  }

  return "default";
}

function QuestionsScreen({
  patientData,
  onUpdate,
  onComplete,
  onBack,
}) {
  const language =
    patientData?.language || "English";

  const config =
    LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.English;

  const bank =
    QUESTION_BANK[language] || QUESTION_BANK.English;

  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [symptomType, setSymptomType] = useState("default");

  const [redFlags, setRedFlags] = useState(
    patientData?.redFlags || []
  );

  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const startedRef = useRef(false);
  const speakingTimerRef = useRef(null);

  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window;

  const recognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window);

  const questions = useMemo(() => {
    return bank[symptomType] || bank.default;
  }, [bank, symptomType]);

  const progress = Math.min(
    100,
    Math.round(
      ((questionIndex + 1) / Math.max(questions.length, 1)) *
        100
    )
  );

  const addConversationMessage = (
    role,
    text
  ) => {
    setConversation((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const speak = (text, onFinished) => {
    if (!speechSupported) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = config.code;
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onFinished?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onFinished?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionSupported || isPaused) {
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      const recognition = new SpeechRecognition();

      recognition.lang = config.code;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage("");
      };

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i += 1
        ) {
          const transcript =
            event.results[i][0]?.transcript || "";

          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const visibleText =
          finalText || interimText;

        if (visibleText) {
          setCurrentAnswer(visibleText);
        }

        if (finalText.trim()) {
          clearTimeout(silenceTimerRef.current);

          setTimeout(() => {
            processAnswer(finalText.trim());
          }, 350);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);

        if (
          event.error !== "aborted" &&
          event.error !== "no-speech"
        ) {
          setErrorMessage(
            "Voice input is unavailable. You can type your answer instead."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setIsListening(false);
      setErrorMessage(
        "Voice input could not be started. You can type your answer instead."
      );
    }
  };

  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
    }

    setIsListening(false);
  };

  const askQuestion = (question) => {
    if (!question || isPaused) {
      return;
    }

    setCurrentQuestion(question);
    setCurrentAnswer("");
    setIsThinking(false);

    addConversationMessage("ai", question);

    speak(question, () => {
      if (!isPaused) {
        setTimeout(() => {
          startListening();
        }, 250);
      }
    });
  };

  const startInterview = () => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    onUpdate?.({
      interviewStatus: "in_progress",
      questionCount: 1,
    });

    addConversationMessage("ai", config.welcome);

    speak(config.welcome, () => {
      setTimeout(() => {
        askQuestion(config.firstQuestion);
      }, 500);
    });
  };

  const processAnswer = (answer) => {
    if (!answer || isThinking) {
      return;
    }

    stopListening();

    setIsThinking(true);
    setCurrentAnswer(answer);

    const detectedFlags = detectRedFlags(answer);

    if (detectedFlags.length > 0) {
      setRedFlags((previous) => {
        const existingIds = new Set(
          previous.map((flag) => flag.id)
        );

        const additions = detectedFlags.filter(
          (flag) => !existingIds.has(flag.id)
        );

        return [...previous, ...additions];
      });
    }

    const detectedType =
      questionIndex === 0
        ? detectSymptomType(answer)
        : symptomType;

    if (questionIndex === 0 && detectedType !== "default") {
      setSymptomType(detectedType);
    }

    const nextBank =
      bank[detectedType] || bank.default;

    const answerRecord = {
      question: currentQuestion,
      answer,
      questionIndex,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [
      ...(patientData?.interviewHistory || []),
      answerRecord,
    ];

    const updatedAnswers = {
      ...(patientData?.answers || {}),
      [`question_${questionIndex + 1}`]: {
        question: currentQuestion,
        answer,
      },
    };

    onUpdate?.({
      answers: updatedAnswers,
      interviewHistory: updatedHistory,
      answeredCount: questionIndex + 1,
      questionCount: questionIndex + 1,
      symptoms:
        detectedType !== "default"
          ? [detectedType]
          : patientData?.symptoms || [],
      redFlags:
        redFlags.length > 0
          ? redFlags
          : detectedFlags,
      clinicalContext: {
        ...(patientData?.clinicalContext || {}),
        ...(questionIndex === 0
          ? {
              chiefComplaint: answer,
            }
          : {}),
      },
    });

    addConversationMessage("patient", answer);

    setTimeout(() => {
      const nextIndex = questionIndex + 1;

      if (nextIndex >= nextBank.length) {
        finishInterview(updatedHistory, updatedAnswers);
        return;
      }

      setQuestionIndex(nextIndex);
      setIsThinking(false);

      const nextQuestion = nextBank[nextIndex];

      setTimeout(() => {
        askQuestion(nextQuestion);
      }, 500);
    }, 850);
  };

  const finishInterview = (
    historyOverride,
    answersOverride
  ) => {
    stopListening();

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    const finalHistory =
      historyOverride ||
      patientData?.interviewHistory ||
      [];

    const finalAnswers =
      answersOverride ||
      patientData?.answers ||
      {};

    const finalRedFlags =
      redFlags.length > 0
        ? redFlags
        : patientData?.redFlags || [];

    addConversationMessage("ai", config.finished);

    setIsThinking(false);

    speak(config.finished, () => {
      setTimeout(() => {
        onComplete?.({
          answers: finalAnswers,
          interviewHistory: finalHistory,
          redFlags: finalRedFlags,
          symptoms: patientData?.symptoms || [],
          questionCount: finalHistory.length,
          answeredCount: finalHistory.length,
          interviewStatus: "completed",
          completedAt: new Date().toISOString(),
          priority:
            finalRedFlags.length > 0
              ? "review"
              : "routine",
        });
      }, 500);
    });
  };

  const handleSubmitTypedAnswer = () => {
    const answer = currentAnswer.trim();

    if (!answer || isThinking) {
      return;
    }

    processAnswer(answer);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);

      setTimeout(() => {
        if (speechSupported && currentQuestion) {
          speak(currentQuestion, () => {
            startListening();
          });
        }
      }, 200);

      return;
    }

    setIsPaused(true);
    stopListening();

    if (speechSupported) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  useEffect(() => {
    startInterview();

    return () => {
      stopListening();

      if (speechSupported) {
        window.speechSynthesis.cancel();
      }

      clearTimeout(speakingTimerRef.current);
    };
    // We intentionally want this to run once when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusText = isThinking
    ? config.thinking
    : isListening
      ? config.listening
      : isSpeaking
        ? "MediKiosk is speaking..."
        : "Ready for your answer";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <StethoscopeIcon />
            </div>

            <div>
              <p className="font-bold text-slate-900">
                MediKiosk
              </p>
              <p className="text-xs text-slate-500">
                AI Clinical Interview
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={14} />
              Patient record loaded
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              {language}
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              {patientData?.consultationType || "Allopathic"}
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Clinical history
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                Question {Math.min(questionIndex + 1, questions.length)}{" "}
                of {questions.length}
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <Clock3 size={15} />
              Voice-first interview
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_340px]">
        {/* Conversation */}
        <section className="flex min-h-[calc(100vh-190px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* AI status */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-4">
              <div
                className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  isListening
                    ? "bg-emerald-100 text-emerald-600"
                    : isSpeaking
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                <Bot size={28} />

                {(isListening || isSpeaking) && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">
                    MediKiosk AI
                  </p>

                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    AI
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {statusText}
                </p>
              </div>

              <button
                type="button"
                onClick={togglePause}
                className="rounded-xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? (
                  <Play size={18} />
                ) : (
                  <Pause size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "patient"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    message.role === "patient"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {message.role === "patient" ? (
                      <Mic size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )}

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        message.role === "patient"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {message.role === "patient"
                        ? "You"
                        : "MediKiosk"}
                    </span>
                  </div>

                  <p className="text-sm leading-7">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "120ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: "240ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current question */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-5">
            <div className="rounded-2xl border border-blue-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Volume2 size={15} />
                Current question
              </div>

              <p className="text-lg font-semibold leading-8 text-slate-900">
                {currentQuestion ||
                  config.firstQuestion}
              </p>
            </div>

            {/* Voice control */}
            <div className="mt-4 flex flex-col items-center">
              <button
                type="button"
                onClick={
                  isListening
                    ? stopListening
                    : startListening
                }
                disabled={isThinking || isPaused}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition ${
                  isListening
                    ? "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                    : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                } ${
                  isThinking || isPaused
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                {isListening ? (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                    <MicOff size={30} />
                  </>
                ) : (
                  <Mic size={30} />
                )}
              </button>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                {isListening
                  ? "Tap to stop listening"
                  : "Tap to speak"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {config.fallback}
              </p>
            </div>

            {/* Text fallback */}
            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Keyboard
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={currentAnswer}
                  onChange={(event) =>
                    setCurrentAnswer(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSubmitTypedAnswer();
                    }
                  }}
                  placeholder="Type your answer if needed..."
                  disabled={isThinking}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitTypedAnswer}
                disabled={
                  !currentAnswer.trim() || isThinking
                }
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
                <ChevronRight size={17} />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0"
                />
                {errorMessage}
              </div>
            )}
          </div>
        </section>

        {/* Side panel */}
        <aside className="space-y-5">
          {/* Listening card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Ear size={20} />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Voice assistant
                </p>

                <p className="text-xs text-slate-500">
                  {config.code}
                </p>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                isListening
                  ? "bg-emerald-50"
                  : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isListening
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {isListening ? (
                    <Mic size={17} />
                  ) : (
                    <MicOff size={17} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {isListening
                      ? "Listening"
                      : "Microphone ready"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {isListening
                      ? "Speak naturally"
                      : "MediKiosk will listen when you speak"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical concern */}
          {redFlags.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <p className="font-bold text-amber-900">
                    Potential clinical concern
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Information requiring clinician review has
                    been detected.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {redFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="rounded-xl bg-white/70 p-3 text-xs font-medium text-amber-900"
                  >
                    {flag.label}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] leading-5 text-amber-700">
                This is not a diagnosis. Please ask a clinician
                to review this information.
              </p>
            </div>
          )}

          {/* What AI is doing */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={17} className="text-blue-600" />

              <p className="font-bold text-slate-900">
                What MediKiosk is doing
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle2,
                  text: "Listening to your answer",
                },
                {
                  icon: CheckCircle2,
                  text: "Identifying relevant details",
                },
                {
                  icon: CheckCircle2,
                  text: "Choosing useful follow-up questions",
                },
                {
                  icon: FileText,
                  text: "Building your clinical history",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.text}
                    className="flex items-start gap-3"
                  >
                    <Icon
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-xs leading-5 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accessibility */}
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <Volume2
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-bold text-blue-900">
                  You don't need to read or type
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-800">
                  MediKiosk is designed so patients can complete
                  the interview mainly by listening and speaking.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StethoscopeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v5a6 6 0 0 0 12 0V3" />
      <path d="M3 3h3M18 3h3" />
      <path d="M12 14v4a4 4 0 0 0 8 0v-1" />
      <circle cx="20" cy="15" r="1" />
    </svg>
  );
}

export default QuestionsScreen;
