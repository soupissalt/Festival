const express = require('express');
const app = express();
const fs = require('fs');
const port = 80;

//node.js의 모듈 path 를 불러오는 코드.
//이 모듈은 디렉터리 경로 작업에 필요한 함수들 제공.
const path = require('path');
//루트 경로로의 접속에 대하여, 해당 html 파일 전송.
app.get('/', (req, res) => {

    //path.join() : 여러 경로를 합하는 역할 함.
    //__dirname : 현재 코드가 실행되고 있는 디렉터리의 절대경로.
    //sendFile('절대경로') : 경로상의 파일을 전송함.
    res.sendFile(path.join(__dirname, 'index.html'));
    //즉, 현재 작업 경로의 index.html 파일에 접근하여 파일 전송.
})

app.get('/mainpage', (req,res) => {

    res.sendFile(path.join(__dirname, 'main.html'));
})

app.get('/pictures/back.png', (req, res)=>{
    fs.readFile('./pictures/back.png', (err, data) => {
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(data);
    })
})
app.get('/img/background.png', (req, res)=>{
    fs.readFile('./img/background.png', (err, data) => {
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(data);
    })
})
app.get('/img/Let.png', (req, res)=>{
    fs.readFile('./img/Let.png', (err, data) => {
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(data);
    })
})
app.get('/img/QR.png', (req, res)=>{
    fs.readFile('./img/QR.png', (err, data) => {
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(data);
    })
})
app.get('/img/mobile-background.png', (req, res)=>{
    fs.readFile('./img/mobile-background.png', (err, data) => {
        res.writeHead(200, {'Content-Type' : 'image/png'});
        res.end(data);
    })
})
app.get('/font/font.ttf', (req, res) => {
    const fontPath = './font/font.ttf';
    
    fs.readFile(fontPath, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.setHeader('Content-Type', 'font/ttf'); // Content-Type 설정
        res.send(data);
    });
});
app.get('/couples', async (req, res) => {
    let couples = [];

    var mysql = require('mysql');
    
    var connection = mysql.createConnection({
        host        : 'localhost',
        user        : 'cksgh',
        database    : 'movie',
        password    : 'cksgh'
    });

    connection.connect();

    let A = [];
   
    connection.query('SELECT * FROM A', (err, rowsA) => {
        if(err) throw err;
        A = [...rowsA];
        // 커플 매칭을 시작합니다.
        startMatching(A);
    });

    function startMatching(A) {
        let continueMatching = true;

        while (continueMatching && A.length > 0) {
            let minDiff = Infinity;
            let match = null;
      
            for (let i = 0; i < A.length; i++) {
                for (let j = 0; j < A.length; j++) {
                    let a = A[i];
                    let b = A[j];

                    if (a === b) continue; // 같은 사람이면 건너뜁니다.

                    //if ((a.others_gender === b.gender || a.others_gender === 3 || b.others_gender === 3 ) && (b.others_gender === a.gender) && Math.abs(a.age - b.age) <= 5)
                        if (((a.others_gender === b.gender && b.others_gender === a.gender) || ( a.others_gender === 3 && b.others_gender === 3 )||(a.others_gender === 3 && (b.others_gender === a.gender)||((b.others_gender === 3) &&(a.others_gender === b.gender)) )) && Math.abs(a.age - b.age) <= 5)
                        {
                        let diff = 1.33*Math.abs(a.movie_type - b.movie_type) + 1.33*Math.abs(a.popcorn_type - b.popcorn_type) + Math.abs(a.movie_ending - b.movie_ending);
                        if (diff < minDiff) {
                            minDiff = diff;
                            match = { a, b };
                        }
                    }
                }
            }
        
            if (match) {
                couples.push(match);
                A = A.filter(item => item !== match.a);
                A = A.filter(item => item !== match.b);
            } else {
                continueMatching = false;
            }
        }
      
        // 커플 매칭 결과를 클라이언트에 전송합니다.
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.write('커플 목록:\n');
        couples.forEach((couple, index) => {
            res.write(`커플 ${index + 1}:\n`);
            res.write(`  - 첫 번째 사람: ${couple.a.name}\n`);
            res.write(`    전화번호: ${couple.a.phone}\n`);
            res.write(`    메시지: ${couple.a.comment}\n`);
            res.write(`  - 두 번째 사람: ${couple.b.name}\n`);
            res.write(`    전화번호: ${couple.b.phone}\n`);
            res.write(`    메시지: ${couple.b.comment}\n\n`);
        });

        // 남겨진 사람 출력
        if (A.length > 0) {
            res.write(`남겨진 사람:\n`);
            A.forEach(person => {
                res.write(`  - 이름: ${person.name}\n`);
                res.write(`    전화번호: ${person.phone}\n`);
                res.write(`    메시지: ${person.comment}\n\n`);
            });
        }

        // 응답 종료
        res.end();

        // 연결 종료
        connection.end();
    }
});


// URL-encoded 데이터를 파싱하는 미들웨어를 추가합니다. - gpt 답변.
//이는 POST 요청을 해석하기 위해 필요.
app.use(express.urlencoded({ extended: true }));

//경로 기반으로 node.js가 응답한다.
//즉, "/submit-name"의 경로로 form이 전송하면, 해당 경로로의 post 입력을 아래 코드가 전달받는다.
app.post('/handlingForm', (req, res) => {
    // req.body에서 데이터를 가져옵니다.
    //const name = req.body.name;  //name 속성이 name인 태그의 입력값을 name 변수에 저장.
    //name 변수 = name속성값이 'name'인 태그의 input 값.

    //res.send(`입력받은 값 : ${name}, ${[Q_1]}`);


    //여기서 DB와의 통신 수행하면 됨.
    var mysql = require('mysql');  //모듈 로드.

    //임시로 유저 이름을 test_user 로 지음.
    //연결시에 사용할 모든 정보를 mysql모듈 내부에 저장.
    var connection = mysql.createConnection({
        host        : 'localhost',
        user        : 'cksgh',
        database    : 'movie',
        //테이블 이름은 query문에 작성하도록 함.
        password    : 'cksgh'
    })

    connection.connect();  //연결 시작.

    //sql문 쿼리.
    //` 와 ' 는 다름. 전자는 백틱(`), 후자는 작은따옴표('). 
    //js에서는 문자열 템플릿을 작성할 때 사용.
    //백틱으로 작성된 문자열에는 변수가 중간에 삽입될 수 있음.

    //복사용 코드.
    // [name, phone, gender, other_gender, age, movie_type, popcorn_type, movie_ending, message, req_time]

    //전송시간 계산하는 부분.
    let date = new Date(); // 현재 날짜와 시간을 가져옵니다.
    let year = date.getFullYear(); // 년도를 가져옵니다.
    let month = date.getMonth() + 1; // 월을 가져옵니다. JavaScript에서는 월이 0부터 시작하므로 1을 더해줍니다.
    let day = date.getDate(); // 일을 가져옵니다.
    let hours = date.getHours(); // 시간을 가져옵니다.
    let minutes = date.getMinutes(); // 분을 가져옵니다.
    let seconds = date.getSeconds(); // 초를 가져옵니다.
    // 각 항목을 두 자리로 만들어 줍니다.
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;
    //전송 양식 맞춤. DATETIME타입.
    let DateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const values = {
        name: req.body.name,
        phone: req.body.phone,
        gender: req.body.gender,
        others_gender: req.body.others_gender,
        age: req.body.age,
        movie_type: req.body.movie_type,
        popcorn_type: req.body.popcorn_type,
        movie_ending: req.body.movie_ending,
        comment: req.body.comment,
        req_time: DateTime,
    };
    connection.query(`INSERT INTO A SET ?`, values, (err, rows, fields) => {
        if(err){
            res.sendFile(path.join(__dirname, 'failed.html'));
        }else{
            res.sendFile(path.join(__dirname, 'success.html'));
        }
    });
    connection.end();  //연결 중단.
});

//응답 대기.
app.listen(port, () => {
    console.log(`example... listening on port : '${port}'`);
})