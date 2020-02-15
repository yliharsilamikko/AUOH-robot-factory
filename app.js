const axios = require('axios');
const mqtt = require('mqtt');

const mqtt_host = 'mqtt://hairdresser.cloudmqtt.com';
const mqtt_options = {
    clientId: 'computer',
    port: 26442,
    host: mqtt_host,
    username: 'chewglle',
    password: '0nA9rGfI7F4h',
    protocol: 'mqtts'
};

// const test_string = `CURRENT JOINT POSITION:
// Joint   1:     89.81
// Joint   2:    -2.58
// Joint   3:    -14.72
// Joint   4:    -58.87
// Joint   5:    -5.81
// Joint   6:     89.81`;


const main_loop = () => {
    setTimeout(() => {
        let start_time_stamp = new Date();

        axios.get('https://fanuc-robot-http-server.herokuapp.com/')
            .then((res) => {
                const time_stamp = new Date();
                const delta = time_stamp - start_time_stamp;
                start_time_stamp = time_stamp;
                const regexp = 'Joint   [1-6]: *(-?.*)';
                let joints = [];
                let matches = res.data.matchAll(regexp);
                let count = 0;
                for (const match of matches) {
                    count++;
                    if (count > 6) break;
                    const value = parseFloat(match[1]);
                    joints.push(value);
                }
                console.log(start_time_stamp, joints, delta, 'ms');
                mqtt_client.publish('robot_joints', JSON.stringify(joints));
                main_loop();
            });
    }, 10);
}

const mqtt_client = mqtt.connect(mqtt_host, mqtt_options);
mqtt_client.on('connect', () => {
    console.log('connected to mqtt broker');
    main_loop();
});