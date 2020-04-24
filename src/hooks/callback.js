import React, {
  useEffect
} from 'react'
import queryString from 'query-string'

const Callback = props => {
  useEffect(() => { }, []);
  const values = queryString.parse(props.location.search)
  console.log(values.success)
  return (
    <div className="callback-container">
      <div class="parent" >
        <i class="fa fa-heart"> </i>
        <div > </div>
        <h1> {values.success === 'true'? "Thank You!" : "I am sorry!"}  </h1>
        <p>
          {values.success === 'true'? "Successfully Authenticated!!!": "Authentication faild!!" }
        </p>
      </div>
    </div>
  )
}

export default Callback;