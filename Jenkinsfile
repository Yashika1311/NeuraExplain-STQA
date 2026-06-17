pipeline {
agent any

```
tools {
    maven 'Maven3'
}

environment {
    FRONTEND_DIR = "client"
    BACKEND_DIR = "server"
    SELENIUM_DIR = "Selenium"
    FRONTEND_URL = "http://localhost:5173"
}

stages {

    stage('Checkout Code') {
        steps {
            git branch: 'main',
                url: 'https://github.com/Yashika1311/NeuraExplain-STQA'
        }
    }

    stage('Start Backend') {
        steps {
            dir("${BACKEND_DIR}") {
                sh '''
                    npm install
                    nohup npm run dev > server.log 2>&1 &
                '''
            }
        }
    }

    stage('Start Frontend (Vite)') {
        steps {
            dir("${FRONTEND_DIR}") {
                sh '''
                    npm install
                    nohup npm run dev -- --host 0.0.0.0 --port 5173 > vite.log 2>&1 &

                    echo "Waiting for frontend to start..."
                    for i in {1..30}; do
                        curl -s http://localhost:5173 && break
                        sleep 2
                    done
                '''
            }
        }
    }

    stage('Run Selenium Tests') {
        steps {
            dir("${SELENIUM_DIR}") {
                sh 'mvn clean test'
            }
        }
    }
}

post {
    always {
        echo 'Pipeline finished. Check reports.'
    }

    success {
        echo 'Build SUCCESS 🎉'
    }

    failure {
        echo 'Build FAILED ❌ Check logs'
    }
}
```

}
