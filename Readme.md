```
\ 
├─ .gitignore
├─ Readme.md
├─ backend
│  ├─ combine_llm.py
│  ├─ combine_response.py
│  ├─ graphRAG
│  │  ├─ add.py
│  │  ├─ graph_query.py
│  │  ├─ llm_response.py
│  │  ├─ query.py
│  │  ├─ query_test.py
│  │  └─ weviate_setup.py
│  ├─ rag
│  │  ├─ add_data.py
│  │  ├─ llm_response.py
│  │  ├─ load_data.py
│  │  ├─ query_db.py
│  │  ├─ vector_db.py
│  │  └─ vectorstore.pkl
│  ├─ requirements.txt
│  └─ server.py
├─ frontend
│  ├─ .gitignore
│  ├─ README.md
│  ├─ components.json
│  ├─ jsconfig.json
│  ├─ next.config.mjs
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ public
│  │  ├─ diagnose-me-logo.svg
│  │  ├─ doctor.png
│  │  └─ patient.png
│  ├─ src
│  │  ├─ app
│  │  │  ├─ admin
│  │  │  │  ├─ doctor-signup
│  │  │  │  │  └─ page.jsx
│  │  │  │  └─ success
│  │  │  │     └─ page.jsx
│  │  │  ├─ api
│  │  │  │  ├─ auth
│  │  │  │  │  ├─ doctor-signup
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  ├─ get-profile
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  ├─ login
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  ├─ signup
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  └─ update-profile
│  │  │  │  │     └─ route.js
│  │  │  │  ├─ chat
│  │  │  │  │  └─ route.js.txt
│  │  │  │  └─ chats
│  │  │  │     ├─ action
│  │  │  │     │  └─ route.js
│  │  │  │     ├─ doctor
│  │  │  │     │  ├─ pending
│  │  │  │     │  │  └─ route.js
│  │  │  │     │  └─ review
│  │  │  │     │     └─ route.js
│  │  │  │     ├─ patient
│  │  │  │     │  └─ route.js
│  │  │  │     └─ query
│  │  │  │        ├─ [chatId]
│  │  │  │        │  └─ route.js
│  │  │  │        └─ route.js
│  │  │  ├─ chat
│  │  │  │  ├─ [chatId]
│  │  │  │  │  └─ page.jsx
│  │  │  │  └─ page.jsx
│  │  │  ├─ globals.css
│  │  │  ├─ layout.js
│  │  │  ├─ page.jsx
│  │  │  └─ signup
│  │  │     └─ page.jsx
│  │  ├─ components
│  │  │  ├─ DoctorDashboard.jsx
│  │  │  ├─ Header.jsx
│  │  │  ├─ PatientChat.jsx
│  │  │  └─ ui
│  │  │     ├─ alert.jsx
│  │  │     ├─ avatar.jsx
│  │  │     ├─ badge.jsx
│  │  │     ├─ button.jsx
│  │  │     ├─ card.jsx
│  │  │     ├─ dialog.jsx
│  │  │     ├─ form.jsx
│  │  │     ├─ input.jsx
│  │  │     ├─ label.jsx
│  │  │     ├─ select.jsx
│  │  │     ├─ tabs.jsx
│  │  │     ├─ textarea.jsx
│  │  │     └─ tooltip.jsx
│  │  ├─ lib
│  │  │  ├─ MongoConnect.js
│  │  │  ├─ auth.js
│  │  │  └─ utils.js
│  │  └─ models
│  │     ├─ Chat.js
│  │     ├─ Doctor.js
│  │     └─ Patient.js
│  └─ tailwind.config.js
├─ graphrag.ipynb
└─ sample_query.txt
```
