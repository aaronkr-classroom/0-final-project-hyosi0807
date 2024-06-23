// controllers/subscribersController.js
"use strict";

const { application } = require("express");
/**
 * Listing 16.4 (p. 230-231)
 * 구독자를 위한 컨트롤러 액션 정의
 */
// 구독자 모델 요청


/**
 * 4-21 구독자 컨트롤러 액션 추가
 */
const Subscriber = require("../models/Subscriber");
  getSubscriberParams = (body) => {  // 4-21 요청으로부터 구독자 데이터를 추출하기 위한 사용자 정의 함수 제작
    return {
      name: body.name,
      email: body.email,
      zipCode: parseInt(body.zipCode)
    };
  };
module.exports = {
  index: (req, res, next) => {  // 4-21 모든 구독자 도큐먼트를 찾기 위한 index action 생성
    Subscriber.find()
      .then(subscribers => {
        res.locals.subscribers = subscribers;
        next();
      })
      .catch(error => {
        console.log(`Error fetching subscribers: ${error.message}`);
        next(error);
      });
  },
  indexView: (req, res) => {
    res.render("subscribers/index");
  },
  new: (req, res) => {
    res.render("subscribers/new");
  },

  create: (req, res, next) => {  // 새로운 구독자 생성을 위한 create action 생성
    let subscriberParams = getSubscriberParams(req.body);
    Subscriber.create(subscriberParams)
      .then(subscriber => {
        res.locals.redirect = "/subscribers";
        res.locals.subscriber = subscriber;
        next();
      })
      .catch(error => {
        console.log(`Error saving subscribers:${error.message}`);
        next(error);
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirectl;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  show: (req, res, next) => {  // 구독자 데이터를 출력하기 위한 show 액션 생성
    var subscriberId = req.params.id;
    Subscriber.findById(subscriberId)
      .then(subscriber => {
        res.locals.subscriber = subscriber;
        next();
      })
  }
}

 
/**
 * 4-21 캡스톤 Subscriber 수정
 */
const mongoose = require("mongoose"),
  { Schema } = mongoose, // Mongoose의 요청
  subscriberSchema = new Schema({
    name: {  // 스키마 속서의 추가
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    zipCode: {
      type: Number,
      min: [10000, "Zip code too short"],
      max: 99999
    },
    courses: [{type: Schema.Types.ObjectId, ref: "Course"}]  // 복수 강좌의 연계
  }, {
    timestamps: true
  });

  subscriberSchema.methods.getInfo = function () {  // getInfo 인스턴스 메소드 추가
    return `Name: ${this.name} Email: ${this.email}
      Zip Code: ${this.zipCode}`;
  };

module.exports = mongoose.model("Subscriber",
  subscriberSchema
); // Subscriber 모델의 export

module.exports = {
  index: (req, res, next) => {
    Subscriber.find() // index 액션에서만 퀴리 실행
      .then((subscribers) => {
        // 사용자 배열로 index 페이지 렌더링
        res.locals.subscribers = subscribers; // 응답상에서 사용자 데이터를 저장하고 다음 미들웨어 함수 호출
        next();
      })
      .catch((error) => {
        // 로그 메시지를 출력하고 홈페이지로 리디렉션
        console.log(`Error fetching subscribers: ${error.message}`);
        next(error); // 에러를 캐치하고 다음 미들웨어로 전달
      });
  },
  indexView: (req, res) => {
    res.render("subscribers/index", {
      page: "subscribers",
      title: "All Subscribers",
    }); // 분리된 액션으로 뷰 렌더링
  },

  /**
   * 노트: 구독자 컨트롤러에서 index 액션이 getAllSubscribers를 대체한다. main.js에서 액션 관련
   * 라우트 index를 가리키도록 수정하고 subscribers.ejs를 index.ejs로 변경된 점을 기억하자. 이
   * 뷰는 views 폴더 아래 subscribers 폴더에 있어야 한다.
   */

  /**
   * Listing 19.2 (p. 278)
   * userController.js에 액션 생성 추가
   */
  // 폼의 렌더링을 위한 새로운 액션 추가
  new: (req, res) => {
    res.render("subscribers/new", {
      page: "new-subscriber",
      title: "New Subscriber",
    });
  },

  // 사용자를 데이터베이스에 저장하기 위한 create 액션 추가
  create: (req, res, next) => {
    let subscriberParams = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      newsletter: req.body.newsletter,
    };
    // 폼 파라미터로 사용자 생성
    Subscriber.create(subscriberParams)
      .then((subscriber) => {
        res.locals.redirect = "/subscribers";
        res.locals.subscriber = subscriber;
        next();
      })
      .catch((error) => {
        console.log(`Error saving subscriber: ${error.message}`);
        next(error);
      });
  },

  // 분리된 redirectView 액션에서 뷰 렌더링
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  /**
   * 노트: 구독자 컨트롤러에 new와 create 액션을 추가하는 것은 새로운 CRUD 액션을 맞춰
   * getAllSubscribers와 saveSubscriber 액션을 삭제할 수 있다는 의미다. 게다가 홈
   * 컨트롤러에서 할 것은 홈페이지인 index.ejs 제공밖에 없다.
   */

  /**
   * Listing 19.7 (p. 285)
   * userController.js에서 특정 사용자에 대한 show 액션 추가
   */
  show: (req, res, next) => {
    let subscriberId = req.params.id; // request params로부터 사용자 ID 수집
    Subscriber.findById(subscriberId) // ID로 사용자 찾기
      .then((subscriber) => {
        res.locals.subscriber = subscriber; // 응답 객체를 통해 다음 믿들웨어 함수로 사용자 전달
        next();
      })
      .catch((error) => {
        console.log(`Error fetching subscriber by ID: ${error.message}`);
        next(error); // 에러를 로깅하고 다음 함수로 전달
      });
  },

  // show 뷰의 렌더링
  showView: (req, res) => {
    res.render("subscribers/show", {
      page: "subscriber-details",
      title: "Subscriber Details",
    });
  },

  /**
   * Listing 20.6 (p. 294)
   * edit와 update 액션 추가
   */
  // edit 액션 추가
  edit: (req, res, next) => {
    var subscriberId = req.params.id;  // 4-21 컨트롤러 제작
    let subscriberId = req.params.id;
    Subscriber.findById(subscriberId) // ID로 데이터베이스에서 사용자를 찾기 위한 findById 사용
      .then((subscriber) => {
        res.render("subscribers/edit", {
          subscriber: subscriber,
          page: subscriber.name,
          title: "Edit Subscriber",
        }); // 데이터베이스에서 내 특정 사용자를 위한 편집 페이지 렌더링
      })
      .catch((error) => {
        console.log(`Error fetching subscriber by ID: ${error.message}`);
        next(error);
      });
  },

  // update 액션 추가
  update: (req, res, next) => {  // 4-21 기존 구독자 도큐먼트의 새로운 값으로 설정하기 위한 update 액션 설정
    let subscriberId = req.params.id,
    subscriberParams = getSubscriberParams(req.body);

    Subscriber.findByIdAndUpdate(subscriberId, {
      $set: subscriberParams,
    }) //ID로 사용자를 찾아 단일 명령으로 레코드를 수정하기 위한 findByIdAndUpdate의 사용
      .then((subscriber) => {
        res.locals.redirect = `/subscribers/${subscriberId}`;
        res.locals.subscriber = subscriber;
        next(); // 지역 변수로서 응답하기 위해 사용자를 추가하고 다음 미들웨어 함수 호출
      })
      .catch((error) => {
        console.log(`Error updating subscriber by ID: ${error.message}`);
        next(error);
      });
  },

  /**
   * Listing 20.9 (p. 298)
   * delete 액션의 추가
   */
  delete: (req, res, next) => {  // 4-21 구독자 도큐먼트를 삭제하기 위한 delete 액션 생성
    let subscriberId = req.params.id;
    Subscriber.findByIdAndRemove(subscriberId) // findByIdAndRemove 메소드를 이용한 사용자 삭제
      .then(() => {
        res.locals.redirect = "/subscribers";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting subscriber by ID: ${error.message}`);
        next();
      });
  },
};