pipeline {
  agent any
  environment {
    HEADLESS = 'true'
    SERVER_DIR = 'server'
    CLIENT_DIR = 'client'
    SELENIUM_DIR = 'Selenium'
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install Server & Client') {
      steps {
        dir("${env.SERVER_DIR}") { sh 'npm ci' }
        dir("${env.CLIENT_DIR}") { sh 'npm ci' }
      }
    }
    stage('Start Backend & Frontend') {
      steps {
        sh '''
        nohup bash -c "cd ${SERVER_DIR} && npm start" > server.log 2>&1 &
        echo $! > server.pid
        nohup bash -c "cd ${CLIENT_DIR} && npm run dev" > client.log 2>&1 &
        echo $! > client.pid
        '''
        sh '''
        for i in {1..30}; do
          curl -sSf http://localhost:5001/ >/dev/null && break || sleep 2
        done
        for i in {1..30}; do
          curl -sSf http://localhost:5173/ >/dev/null && break || sleep 2
        done
        '''
      }
    }
    stage('Run Selenium Tests') {
      steps {
        dir("${SELENIUM_DIR}") { sh 'mvn test -DskipTests=false' }
      }
      post {
        always { junit '**/Selenium/target/surefire-reports/*.xml' }
      }
    }
  }
  post {
    always {
      sh '''
      echo '=== server.log ==='
      sed -n '1,200p' server.log || true
      echo '=== client.log ==='
      sed -n '1,200p' client.log || true
      if [ -f server.pid ]; then kill $(cat server.pid) || true; fi
      if [ -f client.pid ]; then kill $(cat client.pid) || true; fi
      '''
      archiveArtifacts artifacts: 'server.log,client.log,**/target/surefire-reports/*.xml', fingerprint: true
    }
  }
}
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
