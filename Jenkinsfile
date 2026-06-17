pipeline {
    agent any

    tools {
        maven 'Maven3'
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/Yashika1311/NeuraExplain-STQA'
            }
        }

        stage('Frontend') {
            steps {
                sh '''
                    cd client
                    npm install
                    nohup npm run dev -- --host 0.0.0.0 --port 5173 > vite.log 2>&1 &
                    sleep 20
                '''
            }
        }

        stage('Test') {
            steps {
                sh 'mvn -f Selenium/pom.xml clean test'
            }
        }
    }
}
