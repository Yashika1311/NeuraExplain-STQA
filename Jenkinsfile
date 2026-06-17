pipeline {
    agent any

    tools {
        maven 'Maven3'
        nodejs 'Node18'
    }

    environment {
        FRONTEND_DIR = "client"
        BACKEND_DIR = "server"
        SELENIUM_DIR = "Selenium"
        FRONTEND_URL = "http://localhost:5173"
        BACKEND_URL = "http://localhost:5001"
        PATH = "/opt/homebrew/bin:/usr/bin:/bin:$PATH"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'npm install'
                }
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Start Backend & Frontend') {
            steps {
                sh '''
                    echo "Starting Backend..."
                    nohup bash -c "cd ${BACKEND_DIR} && npm run dev" > server.log 2>&1 &
                    echo $! > server.pid

                    echo "Starting Frontend..."
                    nohup bash -c "cd ${FRONTEND_DIR} && npm run dev -- --host 0.0.0.0 --port 5173" > client.log 2>&1 &
                    echo $! > client.pid
                '''

                sh '''
                    echo "Waiting for Backend..."
                    for i in {1..30}; do
                        curl -s ${BACKEND_URL} && break || sleep 2
                    done

                    echo "Waiting for Frontend..."
                    for i in {1..30}; do
                        curl -s ${FRONTEND_URL} && break || sleep 2
                    done
                '''
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
            echo "Stopping servers and cleaning up..."

            sh '''
                if [ -f server.pid ]; then kill $(cat server.pid) || true; fi
                if [ -f client.pid ]; then kill $(cat client.pid) || true; fi

                echo "===== SERVER LOG ====="
                cat server.log || true

                echo "===== CLIENT LOG ====="
                cat client.log || true
            '''

            archiveArtifacts artifacts: '**/*.log, **/target/surefire-reports/*.xml', fingerprint: true
        }

        success {
            echo "BUILD SUCCESS 🎉"
        }

        failure {
            echo "BUILD FAILED ❌ Check logs"
        }
    }
}
