const axios = require('axios');
const mqtt = require('mqtt');

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

                let data = {
                    time: time_stamp,
                    joints: joints
                };

                mqtt_client.publish('joints', JSON.stringify(data));

                console.log(start_time_stamp, joints, delta, 'ms');
                main_loop();
            });
    }, 10);
}

const mqtt_client = mqtt.connect('wss://mqtt-broker-mikko.herokuapp.com');
mqtt_client.on('connect', () => {
    console.log('connected to mqtt broker');
    main_loop();
});