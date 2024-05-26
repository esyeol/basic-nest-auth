module.exports = {
  apps: [
    {
      name: 'nest-plate',
      script: './dist/main.js', // build 파일의 root를 실행시킴
      instances: 0, // 클러스터 모드 사용시 생성되는 인스턴스 수, 단일 스레드에서 멀티스레드로 ELB역할을 해줌 단, 사용되는 CPU 코어수에 따라서 생성.
      watch: false, // 파일 변경시 자동으로 재시작
      merge_logs: false, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐주는 역할
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      out_file: '/home/ubuntu/.pm2/logs/zp_push-out.log',
      error_file: '/home/ubuntu/.pm2/logs/zp_push-error.log',
      autorestart: true, // 프로세스 실패 시 자동으로 재시작
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
