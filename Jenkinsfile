pipeline {
    agent any

    tools {
        maven 'Maven3'
        nodejs 'Node18'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Yashika1311/NeuraExplain-STQA'
            }
        }

       stage('Start Frontend') {
    steps {
        sh '''
            cd client
            npm install
            nohup npm run dev -- --host 0.0.0.0 --port 5173 > vite.log 2>&1 &

            echo "Waiting for frontend..."

            for i in {1..60}
            do
              curl -s http://localhost:5173 && echo "Frontend is UP" && break
              sleep 2
            done
        '''
    }
}

        stage('Run Selenium Tests') {
            steps {
                sh 'mvn -f Selenium/pom.xml clean test'
            }
        }
    }
}
